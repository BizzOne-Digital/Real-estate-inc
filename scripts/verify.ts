/**
 * End-to-end verification against a production build:
 *   - in-memory MongoDB (mongodb-memory-server), seeded with sample data + a test admin
 *   - `next start` on a local port
 *   - a real headless browser (Chrome/Edge via puppeteer-core)
 *
 *   npm run build && npm run verify
 *   (set BROWSER_PATH if Chrome/Edge is not in a standard location; SCREENSHOT_DIR to keep screenshots)
 */
import { spawn, type ChildProcess } from "child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import puppeteer, { type Page } from "puppeteer-core";
import sharp from "sharp";

const PORT = 3123;
const BASE = `http://localhost:${PORT}`;
const ADMIN_EMAIL = "verify-admin@example.test";
const ADMIN_PASSWORD = `Verify-${Math.random().toString(36).slice(2)}-Pass!`;
const SHOTS = process.env.SCREENSHOT_DIR || path.join(tmpdir(), "furniture-verify-shots");

const results: { name: string; ok: boolean; detail?: string }[] = [];
const shot = (name: string) => path.join(SHOTS, `${name}.png`) as `${string}.png`;
function check(name: string, ok: boolean, detail?: string) {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail && !ok ? `  — ${detail}` : ""}`);
}

function findBrowser(): string {
  const candidates = [
    process.env.BROWSER_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean) as string[];
  const found = candidates.find((p) => existsSync(p));
  if (!found) throw new Error("No Chrome/Edge found. Set BROWSER_PATH.");
  return found;
}

function startServer(env: NodeJS.ProcessEnv): ChildProcess {
  const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  const child = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], { env, stdio: ["ignore", "pipe", "pipe"] });
  child.stderr?.on("data", (d) => process.env.VERBOSE && process.stderr.write(d));
  child.stdout?.on("data", (d) => process.env.VERBOSE && process.stdout.write(d));
  return child;
}

async function waitForServer() {
  for (let i = 0; i < 120; i++) {
    try {
      const r = await fetch(`${BASE}/robots.txt`);
      if (r.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Server did not start.");
}

async function stopServer(child: ChildProcess) {
  if (child.exitCode !== null) return;
  await new Promise<void>((resolve) => {
    child.once("exit", () => resolve());
    child.kill();
  });
}

async function get(p: string, init?: RequestInit) {
  const r = await fetch(`${BASE}${p}`, { redirect: "manual", ...init });
  return { status: r.status, headers: r.headers, text: await r.text() };
}

async function waitForAction(page: Page, trigger: () => Promise<unknown>) {
  const resp = page.waitForResponse((r) => r.request().method() === "POST" && !!r.request().headers()["next-action"], { timeout: 30000 });
  await trigger();
  await resp;
  await new Promise((r) => setTimeout(r, 400));
}

async function waitForUpload(page: Page, trigger: () => Promise<unknown>) {
  const done = page.waitForResponse(
    async (r) => {
      if (!r.url().endsWith("/api/upload") || r.request().method() !== "POST") return false;
      try {
        const body = (await r.json()) as { url?: string };
        return typeof body.url === "string";
      } catch {
        return false;
      }
    },
    { timeout: 60000 },
  );
  await trigger();
  const res = await done;
  const body = (await res.json()) as { url: string };
  await new Promise((r) => setTimeout(r, 400));
  return body.url;
}

async function main() {
  mkdirSync(SHOTS, { recursive: true });
  // Start with an empty Next.js data cache so results from previous runs cannot leak in.
  rmSync(path.join(process.cwd(), ".next", "cache", "fetch-cache"), { recursive: true, force: true });
  const workDir = path.join(tmpdir(), `furniture-verify-${Date.now()}`);
  mkdirSync(workDir, { recursive: true });

  console.log("Starting in-memory MongoDB…");
  const mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri("furniture_verify");
  process.env.MONGODB_URI = uri;

  const { seed } = await import("./seed");
  await seed(() => {});
  const { AdminUser } = await import("../src/lib/models");
  await AdminUser.create({ email: ADMIN_EMAIL, name: "Verifier", passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10) });
  check("seed + admin creation", true);
  // Idempotency: second seed must not duplicate or overwrite.
  const { Category, Product } = await import("../src/lib/models");
  await Category.updateOne({ slug: "bedroom" }, { $set: { description: "ADMIN EDIT" } });
  await seed(() => {});
  const bedroom = await Category.findOne({ slug: "bedroom" }).lean();
  check("seed is idempotent and keeps admin edits", bedroom?.description === "ADMIN EDIT" && (await Category.countDocuments()) === 3);
  const productCount = await Product.countDocuments();

  const env = {
    ...process.env,
    MONGODB_URI: uri,
    SESSION_SECRET: "verify-secret-".padEnd(64, "x"),
    NEXT_PUBLIC_SITE_URL: BASE,
    NODE_ENV: "production" as const,
    PORT: String(PORT),
  };
  let server = startServer(env);
  await waitForServer();
  console.log("Server ready.");

  // ---------- Public pages ----------
  const home = await get("/");
  check("GET / 200", home.status === 200);
  check("homepage hero headline", home.text.includes("Beautiful furniture.") && home.text.includes("Better living."));
  check("homepage sections", ["Find your kind of comfort", "Thoughtful Design", "Designed to feel like home.", "Make space for better living."].every((s) => home.text.includes(s)));
  check("homepage uses supplied logo + founder photo", home.text.includes("%2Fbrand%2Flogo.png") && home.text.includes("%2Fbrand%2Ffounder.jpg"));
  check("homepage room cards link to collections", ["/collections/living-room", "/collections/bedroom", "/collections/dining-room"].every((s) => home.text.includes(s)));
  check("social icons hidden when unset", !home.text.includes('aria-label="Instagram"'));

  for (const p of ["/collections", "/collections?category=bedroom&sort=name-asc", "/collections?q=walnut", "/collections/living-room", "/products/arden-sofa", "/about", "/gallery", "/contact", "/sitemap.xml", "/robots.txt"]) {
    const r = await get(p);
    check(`GET ${p} 200`, r.status === 200, `status ${r.status}`);
  }
  const filtered = await get("/collections?category=bedroom");
  check("category filter only shows bedroom products", filtered.text.includes("Harbor Upholstered Bed") && !filtered.text.includes("Arden Sofa"));
  const searched = await get("/collections?q=walnut");
  check("search finds walnut pieces", searched.text.includes("Walnut Dining Table") && !searched.text.includes("Shell Dining Chair"));
  const paged = await get("/collections?page=2");
  check("pagination page 2", paged.status === 200 && paged.text.includes('aria-current="page"'));
  const empty = await get("/collections?q=zzzznothing");
  check("empty state", empty.text.includes("No pieces found"));
  check("product page details", (await get("/products/arden-sofa")).text.includes("Inquire about this piece"));
  check("unique metadata", (await get("/about")).text.includes("<title>About |"));
  const sitemap = await get("/sitemap.xml");
  check("sitemap lists products", sitemap.text.includes("/products/arden-sofa"));
  check("404 for unknown route", (await get("/no-such-page")).status === 404);
  check("404 for unknown product", (await get("/products/does-not-exist")).status === 404);
  check("404 for unknown collection", (await get("/collections/does-not-exist")).status === 404);

  // ---------- Unauthorized access ----------
  const adminNoCookie = await get("/admin");
  check("GET /admin without session redirects to login", adminNoCookie.status === 307 && (adminNoCookie.headers.get("location") ?? "").includes("/admin/login"));
  const forged = await get("/admin/products", { headers: { cookie: "furn_admin_session=forged-token-value" } });
  check("forged session cookie rejected server-side", forged.status !== 200 || !forged.text.includes("New product"), `status ${forged.status}`);
  const fd = new FormData();
  fd.append("file", new Blob([Buffer.from("x")], { type: "image/png" }), "a.png");
  fd.append("folder", "misc");
  check("POST /api/upload without session → 401", (await get("/api/upload", { method: "POST", body: fd, headers: { origin: BASE } })).status === 401);
  check("POST /api/upload cross-site → 403", (await get("/api/upload", { method: "POST", body: fd, headers: { origin: "https://evil.example" } })).status === 403);
  check(
    "DELETE /api/upload without session → 401",
    (await get("/api/upload", { method: "DELETE", body: JSON.stringify({ url: "/api/uploads/misc/1-0000000000000000.png" }), headers: { origin: BASE, "content-type": "application/json" } })).status === 401,
  );
  check("GET traversal filename → 404", (await get("/api/uploads/misc/..%2F..%2Fpackage.json")).status === 404);
  check("GET bad folder → 404", (await get("/api/uploads/secret/1700000000000-0123456789abcdef.png")).status === 404);

  // ---------- Browser ----------
  const browser = await puppeteer.launch({ executablePath: findBrowser(), headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  // tsx/esbuild wraps named functions with __name(); provide it inside the page.
  await page.evaluateOnNewDocument("window.__name = (f) => f;");
  page.setDefaultTimeout(30000);

  // Screenshots for visual review
  await page.setViewport({ width: 1440, height: 900 });
  for (const [name, p] of [["home-desktop", "/"], ["collections-desktop", "/collections"], ["product-desktop", "/products/arden-sofa"], ["about-desktop", "/about"], ["gallery-desktop", "/gallery"], ["contact-desktop", "/contact"]] as const) {
    await page.goto(`${BASE}${p}`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: shot(name), fullPage: true });
  }
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
  await page.screenshot({ path: shot("home-mobile"), fullPage: true });
  const noHScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  check("mobile: no horizontal scroll on homepage", noHScroll);
  await page.click('button[aria-label="Open menu"]');
  await page.waitForSelector("#mobile-nav", { visible: true });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: shot("home-mobile-menu") });
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 400));
  const drawerClosed = await page.evaluate(() => document.querySelector('button[aria-label="Open menu"]')?.getAttribute("aria-expanded") === "false");
  check("mobile menu opens and closes with Escape", drawerClosed);
  await page.click('button[aria-label="Open menu"]');
  await new Promise((r) => setTimeout(r, 300));
  await Promise.all([page.waitForNavigation(), page.click('#mobile-nav a[href="/about"]')]);
  const closedAfterNav = await page.evaluate(() => document.querySelector('button[aria-label="Open menu"]')?.getAttribute("aria-expanded") === "false");
  check("mobile menu closes on navigation", page.url().endsWith("/about") && closedAfterNav);

  await page.setViewport({ width: 1366, height: 900 });

  // Gallery lightbox
  await page.goto(`${BASE}/gallery`, { waitUntil: "networkidle0" });
  await page.click('button[aria-label^="Open image"]');
  await page.waitForSelector("#gallery-lightbox");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 200));
  check("gallery lightbox opens and closes", (await page.$("#gallery-lightbox")) === null);

  // Catalog controls (URL-backed)
  await page.goto(`${BASE}/collections`, { waitUntil: "networkidle0" });
  await page.select("#catalog-sort", "name-desc");
  await page.waitForFunction(() => location.search.includes("sort=name-desc"));
  check("sort select updates URL", page.url().includes("sort=name-desc"));

  // Contact form with product preselected
  await page.goto(`${BASE}/products/arden-sofa`, { waitUntil: "networkidle0" });
  await Promise.all([page.waitForNavigation(), page.click('a[href="/contact?product=arden-sofa"]')]);
  check("inquiry button preselects product", (await page.$eval("#product", (el) => (el as HTMLSelectElement).value)) === "arden-sofa");
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => document.body.innerText.includes("Please correct the highlighted fields."));
  check("contact form server-side validation errors", true);
  await page.type("#name", "Test Visitor");
  await page.type("#email", "visitor@example.test");
  await page.type("#message", "I would like to know more about available finishes.");
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => document.body.innerText.includes("Message sent"));
  check("contact form submission succeeds", true);

  // Admin login
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle0" });
  await page.type("#email", ADMIN_EMAIL);
  await page.type("#password", "wrong-password");
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => document.body.innerText.includes("Incorrect email or password."));
  check("login rejects wrong password", true);
  const emailKept = await page.$eval("#email", (el) => (el as HTMLInputElement).value);
  check("login keeps email after failed attempt", emailKept === ADMIN_EMAIL);
  await page.$eval("#password", (el) => ((el as HTMLInputElement).value = ""));
  await page.type("#password", ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => location.pathname === "/admin", { timeout: 30000 }).catch(async () => {
    console.log("Login page text:", (await page.evaluate(() => document.body.innerText)).slice(0, 500));
  });
  check("admin login", new URL(page.url()).pathname === "/admin");
  const cookies = await browser.cookies();
  const session = cookies.find((c) => c.name === "furn_admin_session");
  check("session cookie is HTTP-only + SameSite=Lax", Boolean(session?.httpOnly) && session?.sameSite === "Lax");
  const dash = await page.evaluate(() => document.body.innerText);
  check("dashboard shows real counts", dash.includes(String(productCount)) && dash.includes("New inquiries"));
  await page.screenshot({ path: shot("admin-dashboard"), fullPage: true });

  await page.goto(`${BASE}/admin/inquiries`, { waitUntil: "networkidle0" });
  check("inquiry stored with product association", (await page.evaluate(() => document.body.innerText)).includes("Arden Sofa"));

  // ---------- Upload API ----------
  const smallPng = await sharp({ create: { width: 64, height: 64, channels: 3, background: "#29345f" } }).png().toBuffer();
  let big = await sharp({ create: { width: 2000, height: 1700, channels: 3, background: "#000", noise: { type: "gaussian", mean: 128, sigma: 70 } } }).jpeg({ quality: 100 }).toBuffer();
  if (big.length > 7.5 * 1024 * 1024) big = await sharp(big).jpeg({ quality: 92 }).toBuffer();
  console.log(`Large test JPEG: ${(big.length / 1024 / 1024).toFixed(2)} MB`);
  const pathA = path.join(workDir, "a.png");
  const pathB = path.join(workDir, "b.jpg");
  writeFileSync(pathA, smallPng);
  writeFileSync(pathB, big);

  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
  const api = await page.evaluate(
    async (pngB64: string, bigB64: string) => {
      const dec = (b: string) => Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
      const post = async (blob: Blob, extra: Record<string, string> = {}, folder = "misc") => {
        const fd = new FormData();
        fd.append("file", blob, "f");
        fd.append("folder", folder);
        for (const [k, v] of Object.entries(extra)) fd.append(k, v);
        const r = await fetch("/api/upload", { method: "POST", body: fd });
        return { status: r.status, body: await r.json().catch(() => null) };
      };
      const out: Record<string, unknown> = {};
      out.valid = await post(new Blob([dec(pngB64)], { type: "image/png" }), {}, "products");
      out.badFolder = await post(new Blob([dec(pngB64)], { type: "image/png" }), {}, "secret");
      out.fakePng = await post(new Blob([new TextEncoder().encode("this is not an image at all")], { type: "image/png" }));
      out.textMime = await post(new Blob([dec(pngB64)], { type: "text/plain" }));
      out.mismatch = await post(new Blob([dec(pngB64)], { type: "image/jpeg" }));
      out.empty = await post(new Blob([], { type: "image/png" }));
      const huge = new Uint8Array(9 * 1024 * 1024);
      huge.set(dec(pngB64).subarray(0, 16));
      out.oversized = await post(new Blob([huge], { type: "image/png" }));
      out.oversizedChunked = await post(new Blob([huge.subarray(0, 1024 * 1024)], { type: "image/png" }), {
        uploadId: "aaaaaaaaaaaaaaaaaaaa",
        chunkIndex: "0",
        totalChunks: "9",
        totalSize: String(huge.length),
        mimeType: "image/png",
      });

      // Chunked upload with a repeated chunk.
      const bigBytes = dec(bigB64);
      const CH = 1024 * 1024;
      const total = Math.ceil(bigBytes.length / CH);
      const id = crypto.randomUUID();
      const meta = (i: number) => ({ uploadId: id, chunkIndex: String(i), totalChunks: String(total), totalSize: String(bigBytes.length), mimeType: "image/jpeg" });
      const chunk = (i: number) => new Blob([bigBytes.subarray(i * CH, Math.min((i + 1) * CH, bigBytes.length))]);
      const steps: unknown[] = [];
      for (let i = 0; i < total; i++) {
        steps.push(await post(chunk(i), meta(i)));
        if (i === 0) steps.push(await post(chunk(0), meta(0))); // retry same chunk
      }
      out.chunkSteps = steps;
      out.chunkFinal = steps[steps.length - 1];
      out.bigLength = bigBytes.length;
      return out;
    },
    smallPng.toString("base64"),
    big.toString("base64"),
  );
  type R = { status: number; body: { url?: string; success?: boolean; size?: number; folder?: string; filename?: string; complete?: boolean } | null };
  const valid = api.valid as R;
  check("valid upload → 201 with url", valid.status === 201 && /^\/api\/uploads\/products\/\d+-[a-f0-9]{16}\.png$/.test(valid.body?.url ?? ""), JSON.stringify(valid));
  check("upload response shape", valid.body?.success === true && valid.body?.folder === "products" && typeof valid.body?.size === "number" && typeof valid.body?.filename === "string");
  check("invalid folder rejected", (api.badFolder as R).status === 400);
  check("fake PNG (bad signature) rejected", (api.fakePng as R).status === 415);
  check("non-image MIME rejected", (api.textMime as R).status === 415);
  check("MIME/signature mismatch rejected", (api.mismatch as R).status === 415);
  check("empty file rejected", (api.empty as R).status === 400);
  check("oversized file rejected (413)", (api.oversized as R).status === 413);
  check("oversized chunked upload rejected (413)", (api.oversizedChunked as R).status === 413);
  const steps = api.chunkSteps as R[];
  check("chunked: intermediate chunks accepted", steps.slice(0, -1).every((s) => s.status === 200 && s.body?.complete === false));
  const chunkFinal = api.chunkFinal as R;
  check("chunked upload completes with final URL", chunkFinal.status === 201 && Boolean(chunkFinal.body?.url), JSON.stringify(chunkFinal));
  check("big file actually used chunk path (>3.5MB)", (api.bigLength as number) > 3.5 * 1024 * 1024);

  const img = await fetch(`${BASE}${valid.body!.url}`);
  const imgBytes = Buffer.from(await img.arrayBuffer());
  check(
    "public image served with correct headers",
    img.status === 200 &&
      img.headers.get("content-type") === "image/png" &&
      img.headers.get("content-length") === String(smallPng.length) &&
      img.headers.get("cache-control") === "public, max-age=31536000, immutable" &&
      img.headers.get("x-content-type-options") === "nosniff" &&
      imgBytes.equals(smallPng),
  );
  const bigUrl = chunkFinal.body!.url!;
  const bigResp = await fetch(`${BASE}${bigUrl}`);
  const bigBack = Buffer.from(await bigResp.arrayBuffer());
  check("chunked image served intact", bigResp.status === 200 && bigBack.equals(big));
  const { UploadChunk, UploadSession, StoredUpload } = await import("../src/lib/models");
  check("temporary chunks cleaned up", (await UploadChunk.countDocuments()) === 0 && (await UploadSession.countDocuments()) === 0);
  const leakCheck = await get("/api/upload", { method: "GET" });
  check("upload endpoint does not list media", leakCheck.status === 405);
  const optimized = await fetch(`${BASE}/_next/image?url=${encodeURIComponent(valid.body!.url!)}&w=640&q=75`);
  check("next/image can optimize /api/uploads images", optimized.status === 200 && (optimized.headers.get("content-type") ?? "").startsWith("image/"));

  // ---------- Content persistence + replacement/removal lifecycle (UI) ----------
  await page.goto(`${BASE}/admin/pages?tab=home`, { waitUntil: "networkidle0" });
  const fileInputs = async () => page.$$('input[type="file"]');
  const urlA = await waitForUpload(page, async () => (await fileInputs())[0].uploadFile(pathA));
  await page.$eval("textarea", (el) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!;
    setter.call(el, "Verified headline.\nSecond line.");
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await waitForAction(page, () => page.click('main button[type="submit"]'));
  if (process.env.VERBOSE_PAGE) console.log("After save:", (await page.evaluate(() => document.body.innerText)).slice(0, 1500));
  let homeHtml = (await get("/")).text;
  check("page content persists and appears publicly", homeHtml.includes("Verified headline.") && homeHtml.includes(encodeURIComponent(urlA)));

  const urlB = await waitForUpload(page, async () => (await fileInputs())[0].uploadFile(pathB));
  check("replacement upload not yet deleting old image", (await fetch(`${BASE}${urlA}`)).status === 200);
  await waitForAction(page, () => page.click('main button[type="submit"]'));
  homeHtml = (await get("/")).text;
  check("replacement saved publicly", homeHtml.includes(encodeURIComponent(urlB)));
  check("old image deleted after replacement save", (await fetch(`${BASE}${urlA}`)).status === 404);

  const removeButtons = await page.$$("xpath/.//button[contains(., 'Remove')]");
  await removeButtons[0].click();
  await waitForAction(page, () => page.click('main button[type="submit"]'));
  check("removed image deleted after save", (await fetch(`${BASE}${urlB}`)).status === 404);
  homeHtml = (await get("/")).text;
  check("homepage falls back to placeholder when hero removed", homeHtml.includes("/placeholder.svg"));

  // Canceled edit: upload without saving leaves the saved content intact.
  await page.goto(`${BASE}/admin/pages?tab=home`, { waitUntil: "networkidle0" });
  const unsavedUrl = await waitForUpload(page, async () => (await fileInputs())[0].uploadFile(pathA));
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
  homeHtml = (await get("/")).text;
  check("canceled edit does not change saved content", !homeHtml.includes(encodeURIComponent(unsavedUrl)) && homeHtml.includes("Verified headline."));

  // Product create via UI
  await page.goto(`${BASE}/admin/products/new`, { waitUntil: "networkidle0" });
  await page.type("#name", "Verify Test Chair");
  await page.type("#description", "Created by the verification script.");
  const productImg = await waitForUpload(page, async () => (await fileInputs())[0].uploadFile(pathA));
  await Promise.all([page.waitForFunction(() => /\/admin\/products\/[a-f0-9]{24}$/.test(location.pathname)), page.click('main button[type="submit"]')]);
  const prodPage = await get("/products/verify-test-chair");
  check("product created in admin appears publicly", prodPage.status === 200 && prodPage.text.includes("Verify Test Chair") && prodPage.text.includes(encodeURIComponent(productImg)));
  check("duplicate slug rejected", await (async () => {
    await page.goto(`${BASE}/admin/products/new`, { waitUntil: "networkidle0" });
    await page.type("#name", "Verify Test Chair");
    await waitForAction(page, () => page.click('main button[type="submit"]'));
    return (await page.evaluate(() => document.body.innerText)).includes("slug is already in use");
  })());

  // Category deletion protection
  await page.goto(`${BASE}/admin/categories`, { waitUntil: "networkidle0" });
  await page.click('button[aria-label="Delete Living Room"]');
  await page.waitForSelector("dialog[open]");
  const dialogText = await page.$eval("dialog[open]", (d) => d.textContent ?? "");
  check("category delete requires reassignment when products exist", dialogText.includes("Choose where to move them"));
  await page.click("dialog[open] .admin-btn-ghost");

  // Settings: social link appears in footer
  await page.goto(`${BASE}/admin/settings`, { waitUntil: "networkidle0" });
  const [igInput] = await page.$$("xpath/.//label[contains(., 'Instagram URL')]/following-sibling::input");
  await igInput.type("https://instagram.com/example");
  await waitForAction(page, () => page.click('main button[type="submit"]'));
  check("settings persist (social icon shown)", (await get("/")).text.includes('aria-label="Instagram"'));

  // Logout + session revocation
  const oldCookie = (await browser.cookies()).find((c) => c.name === "furn_admin_session")!;
  await Promise.all([page.waitForNavigation(), page.click("xpath/.//button[contains(., 'Sign out')]")]);
  check("logout returns to login", page.url().endsWith("/admin/login"));
  const afterLogout = await get("/api/upload", { method: "POST", body: fd, headers: { origin: BASE, cookie: `furn_admin_session=${oldCookie.value}` } });
  check("old session rejected after logout", afterLogout.status === 401);

  await browser.close();

  // ---------- Redeploy simulation ----------
  await stopServer(server);
  server = startServer(env);
  await waitForServer();
  const afterRestart = await fetch(`${BASE}${bigUrl}`);
  check("uploaded images still served after server restart (redeploy)", afterRestart.status === 200 && Buffer.from(await afterRestart.arrayBuffer()).equals(big));
  check("binary never stored in content docs", !(JSON.stringify(await mongoose.connection.db!.collection("pagecontents").find().toArray())).includes("data:image"));
  check("StoredUpload listing excludes binary by default", (await StoredUpload.findOne().lean())?.data === undefined);

  await stopServer(server);
  await mongoose.disconnect();
  await mongo.stop();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed. Screenshots: ${SHOTS}`);
  if (failed.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
