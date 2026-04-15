/**
 * Promote a user to ADMIN by email.
 *
 * Usage:
 *   npx tsx scripts/promote-admin.ts you@example.com
 *
 * Reads DATABASE_URL from .env. To run against production, copy the
 * production connection string into .env locally (and revert after).
 *
 * This script exists because there's no in-app admin promotion path —
 * an admin is required to approve submissions, and the first admin has
 * to be bootstrapped via direct DB write.
 */

import "dotenv/config";
import * as readline from "node:readline";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    })
  );
}

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/promote-admin.ts <email>");
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not set. Add it to .env.");
    process.exit(1);
  }

  // Redact credentials but show host so you can sanity-check the target.
  const hostMatch = dbUrl.match(/@([^/]+)/);
  const host = hostMatch ? hostMatch[1] : "(unknown host)";
  console.log(`Target database host: ${host}`);
  console.log(`Promoting user:       ${email}`);

  const answer = await prompt("Proceed? [y/N] ");
  if (answer.trim().toLowerCase() !== "y") {
    console.log("Aborted.");
    process.exit(0);
  }

  const adapter = new PrismaNeon({ connectionString: dbUrl });
  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, username: true, role: true },
    });

    if (!user) {
      console.error(`No user found with email: ${email}`);
      console.error("The user must sign in at least once before promotion.");
      process.exit(1);
    }

    console.log(`Found user: ${user.username} (${user.email})`);
    console.log(`Current role: ${user.role}`);

    if (user.role === UserRole.ADMIN) {
      console.log("Already an admin. No changes made.");
      return;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: UserRole.ADMIN },
      select: { role: true },
    });

    console.log(`New role:     ${updated.role}`);
    console.log("Done.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
