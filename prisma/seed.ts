/**
 * Seed a database with the curated Canadian catalogue.
 *
 *   npx prisma db seed                 # safe: upserts the catalogue, never deletes
 *   npx tsx prisma/seed.ts --reset     # local/dev only: wipe all data first
 *
 * `--reset` refuses to run with NODE_ENV=production, and refuses on any
 * database that has real (non-system) user accounts unless you also pass
 * --force. The seed never fabricates votes: every comparison starts with zero
 * votes, and research verdicts are labelled as such in the UI.
 *
 * For production, prefer `npx tsx scripts/sync-catalogue.ts` (dry run first).
 */
import "dotenv/config";
import { createPrismaClient } from "../src/lib/db";
import { SYSTEM_USER_EMAIL, syncCatalogue } from "../src/lib/catalogue/sync";

const args = new Set(process.argv.slice(2));
const reset = args.has("--reset");
const force = args.has("--force");

async function main() {
  const prisma = createPrismaClient();
  try {
    if (reset) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("Refusing to --reset with NODE_ENV=production.");
      }
      const realUsers = await prisma.user.count({ where: { email: { not: SYSTEM_USER_EMAIL } } });
      if (realUsers > 0 && !force) {
        throw new Error(
          `This database has ${realUsers} real user account(s). Refusing to wipe it.\n` +
            "If this really is a disposable dev database, re-run with --reset --force."
        );
      }
      console.log("Resetting database (dev only)...");
      await prisma.comparisonFlag.deleteMany();
      await prisma.evidence.deleteMany();
      await prisma.vote.deleteMany();
      await prisma.productComparison.deleteMany();
      await prisma.category.deleteMany();
      await prisma.account.deleteMany();
      await prisma.session.deleteMany();
      await prisma.verificationToken.deleteMany();
      await prisma.user.deleteMany();
    }

    console.log("Syncing catalogue...");
    const summary = await syncCatalogue(prisma);
    console.log(
      `Done: ${summary.created.length} created, ${summary.updated.length} updated, ${summary.unchanged} unchanged, ` +
        `${summary.archived.length} archived, ${summary.talliesCorrected.length} vote tallies corrected.`
    );
    console.log("Approved comparisons per category:", summary.categoryCounts);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
