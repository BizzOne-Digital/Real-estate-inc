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
const SHOTS = process.env.SCREENSHOT_DIR || path.join(tmpdir(), "realestate-verify-shots");

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
  const workDir = path.join(tmpdir(), `realestate-verify-${Date.now()}`);
  mkdirSync(workDir, { recursive: true });

  console.log("Starting in-memory MongoDB…");
  const mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri("realestate_verify");
  process.env.MONGODB_URI = uri;

  const { seed } = await import("./seed");
  await seed(() => {});
  const { AdminUser, Condo, Post } = await import("../src/lib/models");
  await AdminUser.create({ email: ADMIN_EMAIL, name: "Verifier", passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10) });
  check("seed + admin creation", true);
  // Idempotency: second seed must not duplicate or overwrite.
  await Condo.updateOne({ slug: "the-essex-etobicoke" }, { $set: { summary: "ADMIN EDIT" } });
  await seed(() => {});
  const essex = await Condo.findOne({ slug: "the-essex-etobicoke" }).lean();
  check("seed is idempotent and keeps admin edits", essex?.summary === "ADMIN EDIT" && (await Condo.countDocuments()) === 2 && (await Post.countDocuments()) === 3);

  // Calculator maths (pure functions)
  const { landTransferTax, mortgagePayment } = await import("../src/lib/calculators");
  const ltt = landTransferTax(800_000, { toronto: true, firstTimeBuyer: false, residential: true });
  check("LTT: $800k Toronto = $12,475 + $12,475", ltt.ontario === 12_475 && ltt.toronto === 12_475 && ltt.total === 24_950, JSON.stringify(ltt));
  const fthb = landTransferTax(500_000, { toronto: true, firstTimeBuyer: true, residential: true });
  check("LTT: first-time buyer refunds capped at $4,000 / $4,475", fthb.ontarioRefund === 4_000 && fthb.torontoRebate === 4_475 && fthb.total === 6_475 * 2 - 8_475, JSON.stringify(fthb));
  check("LTT: Toronto above $3M asks to contact", landTransferTax(3_500_000, { toronto: true, firstTimeBuyer: false, residential: true }).toronto === null);
  check("LTT: 2.5% bracket above $2M (residential)", landTransferTax(2_500_000, { toronto: false, firstTimeBuyer: false, residential: true }).ontario === 36_475 + 12_500);
  const m = mortgagePayment({ price: 625_000, downPayment: 125_000, ratePct: 5, years: 25, frequency: "monthly" });
  check("Mortgage: $500k at 5% / 25y ≈ $2,908.02 monthly", Math.abs(m.payment - 2908.02) < 0.05 && m.insurance === 0, JSON.stringify(m));
  const insured = mortgagePayment({ price: 500_000, downPayment: 25_000, ratePct: 5, years: 25, frequency: "monthly" });
  check("Mortgage: 5% down adds 4% default insurance", insured.insurance === 19_000 && insured.principal === 494_000);

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
  const SEARCH_URL = "https://www.a1housi.com/property_find_form_common";
  const home = await get("/");
  check("GET / 200", home.status === 200);
  check("homepage hero headline", home.text.includes("Find your place.") && home.text.includes("Move with confidence."));
  check(
    "homepage real estate sections",
    ["Licensed Broker", "Search homes for sale &amp; rent", "Buying", "Selling", "Relocation", "Featured condo buildings", "Personal service you can trust.", "Tools to plan your purchase", "Latest from the market", "What clients say", "Good to know"].every((s) => home.text.includes(s)),
  );
  check("homepage has no furniture content", !/furniture|sofa|collections\//i.test(home.text));
  check("homepage uses supplied logo + founder photo", home.text.includes("%2Fbrand%2Flogo.png") && home.text.includes("%2Fbrand%2Ffounder.jpg"));
  check("Search Properties links to a1housi property search", home.text.includes(SEARCH_URL) && home.text.includes('target="_blank"'));
  check("homepage shows real client testimonial", home.text.includes("Mark and Lorraine Brown"));
  check("social icons hidden when unset", !home.text.includes('aria-label="Instagram"'));

  for (const p of ["/about", "/featured-properties", "/condos", "/condos?city=Mississauga", "/condos/absolute-city-centre-mississauga", "/relocation", "/mortgage", "/land-transfer-tax", "/market-insights", "/market-insights?category=Seller%20Advice", "/market-insights/preparing-your-home-for-sale", "/testimonials", "/contact", "/sitemap.xml", "/robots.txt"]) {
    const r = await get(p);
    check(`GET ${p} 200`, r.status === 200, `status ${r.status}`);
  }
  const featured = await get("/featured-properties");
  check("featured properties links to Relocation.html and property search", featured.text.includes("https://propertylimit.com/Relocation.html") && featured.text.includes(SEARCH_URL));
  const mississauga = await get("/condos?city=Mississauga");
  check("condo city filter", mississauga.text.includes("Absolute City Centre") && !mississauga.text.includes("The Essex"));
  const condoPage = await get("/condos/absolute-city-centre-mississauga");
  check("condo page details + map + inquiry link", condoPage.text.includes("The Absolute Club") && condoPage.text.includes("maps.google.com") && condoPage.text.includes("condo=absolute-city-centre-mississauga"));
  const sellerOnly = await get("/market-insights?category=Seller%20Advice");
  check("insights topic filter", sellerOnly.text.includes("Preparing your home for sale") && !sellerOnly.text.includes("Closing costs every Ontario"));
  const article = await get("/market-insights/preparing-your-home-for-sale");
  check("article renders headings and bullets", article.text.includes("<h2") && article.text.includes("<li>Tidy the lawn"));
  check("relocation content from propertylimit.com", (await get("/relocation")).text.includes("Services for newcomers to Canada"));
  check("testimonials page lists all reviews", (await get("/testimonials")).text.includes("Roger Eddings"));
  check("about page shows broker", (await get("/about")).text.includes("Nadeem Khan"));
  check("unique metadata", (await get("/relocation")).text.includes("<title>Relocation Services |"));
  const sitemap = await get("/sitemap.xml");
  check("sitemap lists condos and articles", sitemap.text.includes("/condos/the-essex-etobicoke") && sitemap.text.includes("/market-insights/closing-costs-for-ontario-home-buyers"));
  check("404 for unknown route", (await get("/no-such-page")).status === 404);
  check("404 for unknown condo", (await get("/condos/does-not-exist")).status === 404);
  check("404 for unknown article", (await get("/market-insights/does-not-exist")).status === 404);
  check("old furniture routes are gone", (await get("/collections")).status === 404 && (await get("/products/arden-sofa")).status === 404);

  // Scheduled article stays hidden until its date.
  await Post.create({ title: "Future article", slug: "future-article", body: "Hidden for now.", publishedAt: new Date(Date.now() + 7 * 86_400_000), published: true });
  check("scheduled article not public yet", (await get("/market-insights/future-article")).status === 404);

  // ---------- Unauthorized access ----------
  const adminNoCookie = await get("/admin");
  check("GET /admin without session redirects to login", adminNoCookie.status === 307 && (adminNoCookie.headers.get("location") ?? "").includes("/admin/login"));
  const forged = await get("/admin/condos", { headers: { cookie: "furn_admin_session=forged-token-value" } });
  check("forged session cookie rejected server-side", forged.status !== 200 || !forged.text.includes("New condo page"), `status ${forged.status}`);
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
  for (const [name, p] of [
    ["home-desktop", "/"],
    ["about-desktop", "/about"],
    ["featured-desktop", "/featured-properties"],
    ["condos-desktop", "/condos"],
    ["condo-desktop", "/condos/absolute-city-centre-mississauga"],
    ["relocation-desktop", "/relocation"],
    ["mortgage-desktop", "/mortgage"],
    ["ltt-desktop", "/land-transfer-tax"],
    ["insights-desktop", "/market-insights"],
    ["article-desktop", "/market-insights/preparing-your-home-for-sale"],
    ["testimonials-desktop", "/testimonials"],
    ["contact-desktop", "/contact"],
  ] as const) {
    await page.goto(`${BASE}${p}`, { waitUntil: "networkidle2" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 250));
      }
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: shot(name), fullPage: true });
  }

  // Desktop dropdown navigation
  await page.goto(`${BASE}/about`, { waitUntil: "networkidle2" });
  await page.click("xpath/.//nav[@aria-label='Main']//button[contains(., 'Services')]");
  await page.waitForSelector("xpath/.//nav[@aria-label='Main']//a[@href='/relocation']", { visible: true });
  await Promise.all([page.waitForFunction(() => location.pathname === "/relocation"), page.click("xpath/.//nav[@aria-label='Main']//a[@href='/relocation']")]);
  check("desktop Services dropdown navigates", new URL(page.url()).pathname === "/relocation");

  // Land transfer tax calculator updates live
  await page.goto(`${BASE}/land-transfer-tax`, { waitUntil: "networkidle2" });
  const priceInput = await page.$("#ltt-calc ~ div input, section[aria-labelledby='ltt-calc'] input[inputmode='numeric']");
  await priceInput!.click({ count: 3 });
  await page.keyboard.press("Backspace");
  await priceInput!.type("400000");
  await page.waitForFunction(() => document.querySelector("section[aria-labelledby='ltt-calc']")?.textContent?.includes("$4,475.00"));
  check("LTT calculator shows $4,475 for $400,000", true);

  // Mortgage calculator renders a payment
  await page.goto(`${BASE}/mortgage`, { waitUntil: "networkidle2" });
  const mortgageText = await page.$eval("section[aria-labelledby='mortgage-calc']", (el) => el.textContent ?? "");
  check("mortgage calculator shows a monthly payment", /Monthlypayment\$[\d,]+\.\d{2}/.test(mortgageText.replace(/\s+/g, "")), mortgageText.slice(0, 200));

  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  for (const p of ["/", "/condos/absolute-city-centre-mississauga", "/land-transfer-tax", "/contact"]) {
    await page.goto(`${BASE}${p}`, { waitUntil: "networkidle2" });
    const ok = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    check(`mobile: no horizontal scroll on ${p}`, ok);
  }
  await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
  await page.screenshot({ path: shot("home-mobile"), fullPage: true });
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
  await Promise.all([page.waitForFunction(() => location.pathname === "/condos"), page.click('#mobile-nav a[href="/condos"]')]);
  await new Promise((r) => setTimeout(r, 300));
  const closedAfterNav = await page.evaluate(() => document.querySelector('button[aria-label="Open menu"]')?.getAttribute("aria-expanded") === "false");
  check("mobile menu closes on navigation", page.url().endsWith("/condos") && closedAfterNav);

  await page.setViewport({ width: 1366, height: 900 });

  // Contact form with condo preselected
  await page.goto(`${BASE}/condos/the-essex-etobicoke`, { waitUntil: "networkidle2" });
  await Promise.all([page.waitForFunction(() => location.pathname === "/contact"), page.click("xpath/.//a[contains(., 'Inquire about this building')]")]);
  await page.waitForSelector("#condo");
  check("condo inquiry preselects building", (await page.$eval("#condo", (el) => (el as HTMLSelectElement).value)) === "the-essex-etobicoke");
  check("condo inquiry preselects interest", (await page.$eval("#interest", (el) => (el as HTMLSelectElement).value)) === "Condominium inquiry");
  await page.click('main button[type="submit"]');
  await page.waitForFunction(() => document.body.innerText.includes("Please correct the highlighted fields."));
  check("contact form server-side validation errors", true);
  await page.type("#name", "Test Visitor");
  await page.type("#email", "visitor@example.test");
  await page.type("#reference", "Suite 1205");
  await page.type("#message", "I would like to know about two-bedroom suites for sale.");
  await page.click('main button[type="submit"]');
  await page.waitForFunction(() => document.body.innerText.includes("Message sent"));
  check("contact form submission succeeds", true);

  // Admin login
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle2" });
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
  check("dashboard shows counts", dash.includes("Condo pages") && dash.includes("Market Insights") && dash.includes("New inquiries"));
  await page.screenshot({ path: shot("admin-dashboard"), fullPage: true });

  await page.goto(`${BASE}/admin/inquiries`, { waitUntil: "networkidle2" });
  check("inquiry stored with condo association", (await page.evaluate(() => document.body.innerText)).includes("Condominium inquiry: The Essex"));

  // ---------- Upload API ----------
  const smallPng = await sharp({ create: { width: 64, height: 64, channels: 3, background: "#29345f" } }).png().toBuffer();
  let big = await sharp({ create: { width: 2000, height: 1700, channels: 3, background: "#000", noise: { type: "gaussian", mean: 128, sigma: 70 } } }).jpeg({ quality: 100 }).toBuffer();
  if (big.length > 7.5 * 1024 * 1024) big = await sharp(big).jpeg({ quality: 92 }).toBuffer();
  console.log(`Large test JPEG: ${(big.length / 1024 / 1024).toFixed(2)} MB`);
  const pathA = path.join(workDir, "a.png");
  const pathB = path.join(workDir, "b.jpg");
  writeFileSync(pathA, smallPng);
  writeFileSync(pathB, big);

  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle2" });
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
      out.valid = await post(new Blob([dec(pngB64)], { type: "image/png" }), {}, "condos");
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
  check("valid upload → 201 with url", valid.status === 201 && /^\/api\/uploads\/condos\/\d+-[a-f0-9]{16}\.png$/.test(valid.body?.url ?? ""), JSON.stringify(valid));
  check("upload response shape", valid.body?.success === true && valid.body?.folder === "condos" && typeof valid.body?.size === "number" && typeof valid.body?.filename === "string");
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
  await page.goto(`${BASE}/admin/pages?tab=home`, { waitUntil: "networkidle2" });
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
  await page.goto(`${BASE}/admin/pages?tab=home`, { waitUntil: "networkidle2" });
  const unsavedUrl = await waitForUpload(page, async () => (await fileInputs())[0].uploadFile(pathA));
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle2" });
  homeHtml = (await get("/")).text;
  check("canceled edit does not change saved content", !homeHtml.includes(encodeURIComponent(unsavedUrl)) && homeHtml.includes("Verified headline."));

  // Condo page created via admin UI
  await page.goto(`${BASE}/admin/condos/new`, { waitUntil: "networkidle2" });
  await page.type("xpath/.//label[contains(., 'Building name')]/following-sibling::input", "Verify Towers");
  await page.type("xpath/.//label[contains(., 'Short summary')]/following-sibling::textarea", "Created by the verification script.");
  const condoImg = await waitForUpload(page, async () => (await fileInputs())[0].uploadFile(pathA));
  await Promise.all([page.waitForFunction(() => /\/admin\/condos\/[a-f0-9]{24}$/.test(location.pathname)), page.click('main button[type="submit"]')]);
  const condoPublic = await get("/condos/verify-towers");
  check("condo page created in admin appears publicly", condoPublic.status === 200 && condoPublic.text.includes("Verify Towers") && condoPublic.text.includes(encodeURIComponent(condoImg)));
  check("duplicate condo slug rejected", await (async () => {
    await page.goto(`${BASE}/admin/condos/new`, { waitUntil: "networkidle2" });
    await page.type("xpath/.//label[contains(., 'Building name')]/following-sibling::input", "Verify Towers");
    await waitForAction(page, () => page.click('main button[type="submit"]'));
    return (await page.evaluate(() => document.body.innerText)).includes("slug is already in use");
  })());

  // Market Insights article created via admin UI
  await page.goto(`${BASE}/admin/insights/new`, { waitUntil: "networkidle2" });
  await page.type("xpath/.//label[contains(., 'Title')]/following-sibling::input", "Verify Market Update");
  await page.type("xpath/.//label[contains(., 'Article text')]/following-sibling::textarea", "## Summary\n\nThe market is changing.\n\n- Point one\n- Point two");
  await Promise.all([page.waitForFunction(() => /\/admin\/insights\/[a-f0-9]{24}$/.test(location.pathname)), page.click('main button[type="submit"]')]);
  const postPublic = await get("/market-insights/verify-market-update");
  check("article created in admin appears publicly", postPublic.status === 200 && postPublic.text.includes("Verify Market Update") && postPublic.text.includes("<li>Point one</li>"));
  check("new article listed on homepage", (await get("/")).text.includes("Verify Market Update"));

  // Settings: social link appears in footer
  await page.goto(`${BASE}/admin/settings`, { waitUntil: "networkidle2" });
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
  // Remove cached test data so a later `next start` against the real database does not serve it.
  rmSync(path.join(process.cwd(), ".next", "cache", "fetch-cache"), { recursive: true, force: true });
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
