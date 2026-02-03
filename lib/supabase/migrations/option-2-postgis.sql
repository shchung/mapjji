-- OPTION 2: Migrate to PostGIS geography type
-- Industry standard for geographic data
-- Pros: Spatial indexing, distance queries, best practices, future-proof
-- Cons: More complex migration, requires code changes, learning curve

-- Step 1: Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Step 2: Add geography column
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS location geography(POINT);

-- Step 3: Populate location from existing lat/lng
-- NOTE: ST_Point takes (longitude, latitude) - reversed order!
UPDATE restaurants 
SET location = ST_SetSRID(ST_Point(lng, lat), 4326)::geography
WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Step 4: Add NOT NULL constraint after populating
ALTER TABLE restaurants ALTER COLUMN location SET NOT NULL;

-- Step 5: Create spatial index (GIST) for fast queries
CREATE INDEX IF NOT EXISTS idx_restaurants_location_gist 
ON restaurants USING GIST (location);

-- Step 6: Drop old lat/lng columns (OPTIONAL - keep for backwards compatibility)
-- Uncomment these lines only if you're sure you want to remove old columns
-- ALTER TABLE restaurants DROP COLUMN lat;
-- ALTER TABLE restaurants DROP COLUMN lng;
-- DROP INDEX IF EXISTS idx_restaurants_lat_lng;

-- Step 7: Create helper function for nearby search
CREATE OR REPLACE FUNCTION nearby_restaurants(
  search_lat double precision,
  search_lng double precision,
  radius_meters double precision DEFAULT 100
)
RETURNS TABLE (
  id uuid,
  name text,
  address text,
  phone text,
  avg_spice_level numeric,
  distance_meters double precision,
  lat double precision,
  lng double precision
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    r.id,
    r.name,
    r.address,
    r.phone,
    r.avg_spice_level,
    ST_Distance(
      r.location,
      ST_SetSRID(ST_Point(search_lng, search_lat), 4326)::geography
    ) as distance_meters,
    ST_Y(r.location::geometry) as lat,
    ST_X(r.location::geometry) as lng
  FROM restaurants r
  WHERE ST_DWithin(
    r.location,
    ST_SetSRID(ST_Point(search_lng, search_lat), 4326)::geography,
    radius_meters
  )
  ORDER BY r.location <-> ST_SetSRID(ST_Point(search_lng, search_lat), 4326)::geography;
$$;

-- Step 8: Create function to get or create restaurant by location
CREATE OR REPLACE FUNCTION get_or_create_restaurant_by_location(
  search_name text,
  search_lat double precision,
  search_lng double precision,
  search_address text DEFAULT NULL,
  search_phone text DEFAULT NULL,
  tolerance_meters double precision DEFAULT 10
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  restaurant_id uuid;
  search_point geography;
BEGIN
  search_point := ST_SetSRID(ST_Point(search_lng, search_lat), 4326)::geography;
  
  SELECT id INTO restaurant_id
  FROM restaurants
  WHERE name = search_name
    AND ST_DWithin(location, search_point, tolerance_meters)
  LIMIT 1;
  
  IF restaurant_id IS NULL THEN
    INSERT INTO restaurants (name, location, address, phone)
    VALUES (search_name, search_point, search_address, search_phone)
    RETURNING id INTO restaurant_id;
  END IF;
  
  RETURN restaurant_id;
END;
$$;

-- Verification queries
DO $$
DECLARE
  total_count INTEGER;
  with_location INTEGER;
  null_location INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM restaurants;
  SELECT COUNT(*) INTO with_location FROM restaurants WHERE location IS NOT NULL;
  SELECT COUNT(*) INTO null_location FROM restaurants WHERE location IS NULL;
  
  RAISE NOTICE 'Total restaurants: %', total_count;
  RAISE NOTICE 'With location: %', with_location;
  RAISE NOTICE 'NULL locations: %', null_location;
END $$;

-- Test nearby search function
SELECT * FROM nearby_restaurants(37.5032274550881, 127.052009891848, 100)
LIMIT 5;

-- Show sample data
SELECT 
  id,
  name,
  ST_Y(location::geometry) as lat,
  ST_X(location::geometry) as lng,
  location
FROM restaurants
WHERE location IS NOT NULL
LIMIT 5;

-- AFTER MIGRATION:
-- See lib/supabase/postgis-example-usage.ts for code changes needed
