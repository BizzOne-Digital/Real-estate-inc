/**
 * Create (or reset the password of) an admin user. There is no public registration.
 *
 *   npm run create-admin -- --email owner@example.com --name "Owner"
 *   npm run create-admin -- --email owner@example.com --reset
 *
 * The password is read from the ADMIN_PASSWORD environment variable if set,
 * otherwise you are prompted for it (input hidden). Minimum 12 characters.
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { createInterface } from "readline";
import { connectDB } from "../src/lib/db";
import { AdminSession, AdminUser } from "../src/lib/models";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function promptHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const out = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream };
    let muted = false;
    out._writeToOutput = (s: string) => {
      if (!muted) out.output.write(s);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    muted = true;
  });
}

async function main() {
  const email = arg("email")?.trim().toLowerCase();
  const name = arg("name")?.trim() ?? "";
  const reset = process.argv.includes("--reset");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("Usage: npm run create-admin -- --email you@example.com [--name \"Your Name\"] [--reset]");
    process.exit(1);
  }

  let password = process.env.ADMIN_PASSWORD ?? "";
  if (!password) {
    password = await promptHidden("Password (min 12 characters): ");
    const confirm = await promptHidden("Confirm password: ");
    if (password !== confirm) {
      console.error("Passwords do not match.");
      process.exit(1);
    }
  }
  if (password.length < 12) {
    console.error("Password must be at least 12 characters.");
    process.exit(1);
  }

  await connectDB();
  await AdminUser.createIndexes();
  const existing = await AdminUser.findOne({ email });
  const passwordHash = await bcrypt.hash(password, 12);

  if (existing) {
    if (!reset) {
      console.error(`An admin with email ${email} already exists. Use --reset to change the password.`);
      process.exit(1);
    }
    existing.passwordHash = passwordHash;
    existing.failedLogins = 0;
    existing.set("lockUntil", null);
    if (name) existing.name = name;
    await existing.save();
    // Sign out all existing sessions for this account.
    await AdminSession.deleteMany({ admin: existing._id });
    console.log(`Password reset for ${email}. Existing sessions were signed out.`);
  } else {
    await AdminUser.create({ email, name, passwordHash });
    console.log(`Admin user created: ${email}`);
  }
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
