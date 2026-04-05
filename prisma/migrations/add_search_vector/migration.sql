-- Enable pg_trgm extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add search vector column
ALTER TABLE "ProductComparison" ADD COLUMN IF NOT EXISTS "searchVector" tsvector;

-- Create GIN index
CREATE INDEX IF NOT EXISTS "ProductComparison_searchVector_idx" ON "ProductComparison" USING GIN ("searchVector");

-- Create trigram index on common search fields
CREATE INDEX IF NOT EXISTS "ProductComparison_genericProductName_trgm_idx" ON "ProductComparison" USING GIN ("genericProductName" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "ProductComparison_nameBrandProductName_trgm_idx" ON "ProductComparison" USING GIN ("nameBrandProductName" gin_trgm_ops);

-- Populate search vector for existing rows
UPDATE "ProductComparison" SET "searchVector" =
  to_tsvector('english', coalesce("genericProductName", '') || ' ' ||
  coalesce("genericBrand", '') || ' ' ||
  coalesce("genericStore", '') || ' ' ||
  coalesce("nameBrandProductName", '') || ' ' ||
  coalesce("nameBrand", ''));

-- Create trigger to auto-update on INSERT/UPDATE
CREATE OR REPLACE FUNCTION update_search_vector() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" := to_tsvector('english',
    coalesce(NEW."genericProductName", '') || ' ' ||
    coalesce(NEW."genericBrand", '') || ' ' ||
    coalesce(NEW."genericStore", '') || ' ' ||
    coalesce(NEW."nameBrandProductName", '') || ' ' ||
    coalesce(NEW."nameBrand", ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_comparison_search_vector_update
  BEFORE INSERT OR UPDATE ON "ProductComparison"
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();
