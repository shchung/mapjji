-- OPTION 1: Migrate to double precision columns
-- Increases precision from 8 decimals to 15 decimals (IEEE 754 standard)
-- Pros: Simple, minimal code changes, 15-digit precision
-- Cons: Still uses exact equality matching, no geospatial features

-- Step 1: Change column types to double precision
ALTER TABLE restaurants 
  ALTER COLUMN lat TYPE double precision,
  ALTER COLUMN lng TYPE double precision;

-- Step 2: Recreate index with new types
DROP INDEX IF EXISTS idx_restaurants_lat_lng;
CREATE INDEX idx_restaurants_lat_lng ON restaurants(lat, lng);

-- Step 3: Verify data integrity
DO $$
DECLARE
  total_count INTEGER;
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM restaurants;
  SELECT COUNT(*) INTO null_count FROM restaurants WHERE lat IS NULL OR lng IS NULL;
  
  RAISE NOTICE 'Total restaurants: %', total_count;
  RAISE NOTICE 'Restaurants with NULL coordinates: %', null_count;
  RAISE NOTICE 'Valid coordinates: %', total_count - null_count;
END $$;

-- Show sample data with new precision
SELECT 
  id, 
  name, 
  lat, 
  lng,
  CASE 
    WHEN lat IS NOT NULL THEN length(lat::text) - length(replace(lat::text, '.', '')) 
    ELSE 0 
  END as lat_decimal_places,
  CASE 
    WHEN lng IS NOT NULL THEN length(lng::text) - length(replace(lng::text, '.', '')) 
    ELSE 0 
  END as lng_decimal_places
FROM restaurants 
WHERE lat IS NOT NULL AND lng IS NOT NULL
LIMIT 5;

-- AFTER MIGRATION:
-- 1. Remove rounding code from app/page.tsx (lines 512-515, 627-630)
-- 2. Use coordinates directly without rounding
-- 3. Still use .limit(1).maybeSingle() to handle any remaining duplicates
