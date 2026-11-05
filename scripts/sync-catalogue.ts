/**
 * Apply the curated Canadian catalogue to a database (production-safe).
 *
 *   npx tsx scripts/sync-catalogue.ts            # DRY RUN: shows what would change, writes nothing
 *   npx tsx scripts/sync-catalogue.ts --apply    # apply the changes
 *
 * What it does, in one transaction:
 *   1. Upserts the 8 categories (names/icons).
 *   2. Upserts every catalogue comparison by slug (Canadian stores, CAD prices,
 *      sizes, research verdicts). Comparisons an admin archived or rejected
 *      are left alone. Pending ones in the catalogue become approved.
 *   3. Replaces evidence authored by the system account when it changed.
 *      User-submitted evidence is never touched.
 *   4. Archives legacy comparisons that don't fit a Canadian catalogue
 *      (hidden, not deleted — restore any of them from the admin dashboard).
 *   5. Recounts every vote tally from real Vote rows (removes the fabricated
 *      totals the original seed wrote).
 *   6. Recomputes category counts.
 *
 * Idempotent: a second run reports no changes. Run `npx prisma db push`
 * first so the new columns exist.
 */
import "dotenv/config";
import { createPrismaClient } from "../src/lib/db";
import { syncCatalogue } from "../src/lib/catalogue/sync";

async function main() {
  const apply = process.argv.includes("--apply");
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. Add it to .env (or export it) first.");
    process.exit(1);
  }
  const host = url.match(/@([^/:?]+)/)?.[1] ?? "(unknown host)";
  console.log(`Target database: ${host}`);
  console.log(apply ? "Mode: APPLY (changes will be written)\n" : "Mode: DRY RUN (nothing will be written; add --apply to write)\n");

  const prisma = createPrismaClient(url);
  try {
    const summary = await syncCatalogue(prisma, { dryRun: !apply, log: (m) => console.log(`  ${m}`) });

    console.log("\nSummary");
    console.log(`  Categories upserted:      ${summary.categoriesUpserted}`);
    console.log(`  Comparisons created:      ${summary.created.length}`);
    console.log(`  Comparisons updated:      ${summary.updated.length}`);
    console.log(`  Unchanged:                ${summary.unchanged}`);
    console.log(`  Need editorial review:    ${summary.needsReview.length} (facts changed, review date cleared)`);
    console.log(`  Left alone (admin chose): ${summary.skippedByAdmin.length}`);
    console.log(`  Archived (legacy/US):     ${summary.archived.length}`);
    console.log(`  Evidence sets replaced:   ${summary.evidenceReplaced.length}`);
    console.log(`  Vote tallies corrected:   ${summary.talliesCorrected.length}`);
    if (summary.talliesCorrected.length > 0) {
      const sample = summary.talliesCorrected.slice(0, 10).map((t) => `${t.slug} ${t.from}→${t.to}`);
      console.log(`    e.g. ${sample.join(", ")}${summary.talliesCorrected.length > 10 ? ", …" : ""}`);
    }
    console.log("  Approved per category:   ", summary.categoryCounts);
    console.log(apply ? "\nApplied." : "\nDry run complete — nothing was written. Re-run with --apply.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
