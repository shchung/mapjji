-- Cleanup duplicate restaurants and consolidate reviews
-- Run this in Supabase Dashboard SQL Editor

-- Step 1: Migrate all reviews to the oldest restaurant for each duplicate group
WITH duplicate_groups AS (
  SELECT 
    name, 
    lat, 
    lng,
    MIN(created_at) as oldest_created_at
  FROM restaurants
  GROUP BY name, lat, lng
  HAVING COUNT(*) > 1
),
restaurants_to_keep AS (
  SELECT DISTINCT ON (r.name, r.lat, r.lng)
    r.id as keep_id,
    r.name,
    r.lat,
    r.lng
  FROM restaurants r
  INNER JOIN duplicate_groups dg 
    ON r.name = dg.name 
    AND r.lat = dg.lat 
    AND r.lng = dg.lng
    AND r.created_at = dg.oldest_created_at
  ORDER BY r.name, r.lat, r.lng, r.created_at
),
restaurants_to_delete AS (
  SELECT r.id as delete_id, rtk.keep_id
  FROM restaurants r
  INNER JOIN restaurants_to_keep rtk
    ON r.name = rtk.name
    AND r.lat = rtk.lat
    AND r.lng = rtk.lng
    AND r.id != rtk.keep_id
)
UPDATE reviews
SET restaurant_id = rtd.keep_id
FROM restaurants_to_delete rtd
WHERE reviews.restaurant_id = rtd.delete_id;

-- Step 2: Delete duplicate restaurants
WITH duplicate_groups AS (
  SELECT 
    name, 
    lat, 
    lng,
    MIN(created_at) as oldest_created_at
  FROM restaurants
  GROUP BY name, lat, lng
  HAVING COUNT(*) > 1
),
restaurants_to_keep AS (
  SELECT DISTINCT ON (r.name, r.lat, r.lng)
    r.id as keep_id,
    r.name,
    r.lat,
    r.lng
  FROM restaurants r
  INNER JOIN duplicate_groups dg 
    ON r.name = dg.name 
    AND r.lat = dg.lat 
    AND r.lng = dg.lng
    AND r.created_at = dg.oldest_created_at
  ORDER BY r.name, r.lat, r.lng, r.created_at
)
DELETE FROM restaurants
WHERE id IN (
  SELECT r.id
  FROM restaurants r
  INNER JOIN restaurants_to_keep rtk
    ON r.name = rtk.name
    AND r.lat = rtk.lat
    AND r.lng = rtk.lng
    AND r.id != rtk.keep_id
);

-- Step 3: Recalculate avg_spice_level for all restaurants
UPDATE restaurants r
SET avg_spice_level = (
  SELECT ROUND(AVG(spice_level)::numeric, 1)
  FROM reviews
  WHERE restaurant_id = r.id
)
WHERE EXISTS (
  SELECT 1 FROM reviews WHERE restaurant_id = r.id
);

-- Step 4: Add unique constraint to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurants_unique_location 
ON restaurants(name, lat, lng);

-- Show results
SELECT 
  'Total restaurants' as metric,
  COUNT(*)::text as value
FROM restaurants
UNION ALL
SELECT 
  'Restaurants with duplicates' as metric,
  COUNT(*)::text as value
FROM (
  SELECT name, lat, lng
  FROM restaurants
  GROUP BY name, lat, lng
  HAVING COUNT(*) > 1
) duplicates
UNION ALL
SELECT 
  'Total reviews' as metric,
  COUNT(*)::text as value
FROM reviews;
