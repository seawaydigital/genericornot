/**
 * Apply the PostgreSQL full-text search migration.
 *
 * This script adds:
 * - pg_trgm extension for fuzzy matching
 * - GIN index on searchVector column (column created via prisma db push)
 * - Trigram indexes for fuzzy matching on product names
 * - Auto-update trigger to maintain searchVector on INSERT/UPDATE
 * - Backfills searchVector for all existing rows
 *
 * Usage:
 *   npx tsx prisma/apply-search-migration.ts
 *
 * This is idempotent — safe to run multiple times (uses IF NOT EXISTS).
 * Run `npx prisma db push` before this script to ensure the searchVector
 * column exists.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// Each step is a separate string — no semicolon splitting, no dollar-quote breakage.
const steps: Array<{ name: string; sql: string }> = [
  {
    name: "Enable pg_trgm extension",
    sql: `CREATE EXTENSION IF NOT EXISTS pg_trgm`,
  },
  {
    name: "Create GIN index on searchVector",
    sql: `CREATE INDEX IF NOT EXISTS "ProductComparison_searchVector_idx" ON "ProductComparison" USING GIN ("searchVector")`,
  },
  {
    name: "Create trigram index on genericProductName",
    sql: `CREATE INDEX IF NOT EXISTS "ProductComparison_genericProductName_trgm_idx" ON "ProductComparison" USING GIN ("genericProductName" gin_trgm_ops)`,
  },
  {
    name: "Create trigram index on nameBrandProductName",
    sql: `CREATE INDEX IF NOT EXISTS "ProductComparison_nameBrandProductName_trgm_idx" ON "ProductComparison" USING GIN ("nameBrandProductName" gin_trgm_ops)`,
  },
  {
    name: "Backfill searchVector for existing rows",
    sql: `UPDATE "ProductComparison" SET "searchVector" = to_tsvector('english',
      coalesce("genericProductName", '') || ' ' ||
      coalesce("genericBrand", '') || ' ' ||
      coalesce("genericStore", '') || ' ' ||
      coalesce("nameBrandProductName", '') || ' ' ||
      coalesce("nameBrand", ''))`,
  },
  {
    // Dollar-quoted string kept intact — not split on semicolons
    name: "Create update_search_vector() function",
    sql: `CREATE OR REPLACE FUNCTION update_search_vector() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" := to_tsvector('english',
    coalesce(NEW."genericProductName", '') || ' ' ||
    coalesce(NEW."genericBrand", '') || ' ' ||
    coalesce(NEW."genericStore", '') || ' ' ||
    coalesce(NEW."nameBrandProductName", '') || ' ' ||
    coalesce(NEW."nameBrand", ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql`,
  },
  {
    // DO block checks existence so this is idempotent without IF NOT EXISTS
    name: "Create search vector trigger",
    sql: `DO $outer$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'product_comparison_search_vector_update'
  ) THEN
    CREATE TRIGGER product_comparison_search_vector_update
      BEFORE INSERT OR UPDATE ON "ProductComparison"
      FOR EACH ROW EXECUTE FUNCTION update_search_vector();
  END IF;
END $outer$`,
  },
];

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const host = process.env.DATABASE_URL?.match(/@([^/]+)\//)?.[1] ?? "unknown";
  console.log(`Applying full-text search migration to: ${host}\n`);

  let failed = 0;
  for (const step of steps) {
    process.stdout.write(`  ${step.name}... `);
    try {
      await prisma.$executeRawUnsafe(step.sql);
      console.log("✓");
    } catch (err: any) {
      console.log(`✗  ${err?.meta?.message ?? err?.message ?? err}`);
      failed++;
    }
  }

  console.log("");

  if (failed === 0) {
    const rows = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*) AS count FROM "ProductComparison" WHERE "searchVector" IS NOT NULL`
    );
    console.log(`Migration complete. ${rows[0]?.count ?? 0} rows indexed.`);
  } else {
    console.log(`Migration finished with ${failed} error(s) — see above.`);
    process.exit(1);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
