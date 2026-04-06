/**
 * Apply the PostgreSQL full-text search migration.
 *
 * This script adds:
 * - pg_trgm extension for fuzzy matching
 * - searchVector tsvector column on ProductComparison
 * - GIN indexes for fast full-text search
 * - Trigram indexes for fuzzy matching on product names
 * - Auto-update trigger to maintain searchVector on INSERT/UPDATE
 *
 * Usage:
 *   npx tsx prisma/apply-search-migration.ts
 *
 * This is idempotent — safe to run multiple times (uses IF NOT EXISTS).
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { readFileSync } from "fs";
import { join } from "path";

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  console.log("Applying full-text search migration...");

  const migrationSql = readFileSync(
    join(__dirname, "search_vector_migration_backup", "migration.sql"),
    "utf-8"
  );

  // Split by semicolons and execute each statement separately
  // (Prisma $executeRawUnsafe doesn't support multi-statement queries)
  const statements = migrationSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const statement of statements) {
    const sql = statement + ";";
    console.log(`  Executing: ${sql.substring(0, 80)}...`);
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log("  ✓ Done");
    } catch (error) {
      // Some statements like CREATE EXTENSION may fail if already exists
      // but we use IF NOT EXISTS so this shouldn't happen
      console.error(`  ✗ Error: ${error}`);
    }
  }

  // Verify the migration worked
  const result = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*) as count FROM "ProductComparison" WHERE "searchVector" IS NOT NULL`
  );
  console.log(`\nMigration complete. ${result[0]?.count ?? 0} rows have search vectors populated.`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
