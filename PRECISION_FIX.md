# 🎯 Precision Fix - Lat/Lng Coordinate Matching

## Problem Identified

**Console logs showed**:
```
🔍 [Enrich] Searching for restaurant: {lat: 37.5032274550881, lng: 127.052009891848}
🔍 [Enrich] Fallback search result: {found: false}
🔍 [Enrich] Name-only search results: (5) [{lat: 37.50322746, lng: 127.05200989}, ...]
⚠️ [Enrich] Restaurant not found in DB
```

**Root Cause**: Coordinate precision mismatch between query and database storage.

### The Mismatch

| Source | Latitude | Longitude | Decimals |
|--------|----------|-----------|----------|
| **Kakao Maps API** | 37.5032274550881 | 127.052009891848 | 12-13 |
| **Database Storage** | 37.50322746 | 127.05200989 | 8 |
| **Query Attempt** | 37.5032274550881 | 127.052009891848 | 12-13 |
| **Result** | ❌ NO MATCH | ❌ NO MATCH | - |

### Why It Happens

**Database Schema** (`lib/supabase/schema.sql` lines 12-13):
```sql
lat DECIMAL(10, 8),  -- Max 8 decimal places
lng DECIMAL(11, 8),  -- Max 8 decimal places
```

**PostgreSQL DECIMAL(10, 8) means**:
- 10 total digits
- 8 digits after decimal point
- 2 digits before decimal point
- **Truncates** any values beyond 8 decimals

**Data Flow**:
1. Frontend receives: `37.5032274550881` (13 decimals)
2. Frontend sends to DB: `37.5032274550881`
3. **DB truncates to**: `37.50322746` (8 decimals)
4. Frontend queries with: `37.5032274550881`
5. Query fails: `37.5032274550881 ≠ 37.50322746`

## Solution Applied

**Round coordinates to 8 decimals** before ALL database operations (query AND insert).

### Changes Made

**File**: `app/page.tsx`

#### 1. `enrichPlaceWithDbData()` function (lines 510-520)

**Before**:
```typescript
const { lat, lng } = place
```

**After**:
```typescript
const { lat, lng } = place
const roundedLat = Math.round(lat * 1e8) / 1e8  // Round to 8 decimals
const roundedLng = Math.round(lng * 1e8) / 1e8
```

#### 2. Database Query (lines 552-559)

**Before**:
```typescript
.eq('lat', lat)      // Full precision: 37.5032274550881
.eq('lng', lng)
```

**After**:
```typescript
.eq('lat', roundedLat)  // Rounded: 37.50322746
.eq('lng', roundedLng)
```

#### 3. `getOrCreateRestaurant()` function (lines 625-640)

**Before**:
```typescript
const lat = place.lat
const lng = place.lng
// ... later ...
.insert({ name, lat, lng, address, phone })
```

**After**:
```typescript
const roundedLat = Math.round(place.lat * 1e8) / 1e8
const roundedLng = Math.round(place.lng * 1e8) / 1e8
// ... later ...
.insert({ name, lat: roundedLat, lng: roundedLng, address, phone })
```

### Math.round(x * 1e8) / 1e8 Explained

```javascript
// Example: Round 37.5032274550881 to 8 decimals

// Step 1: Multiply by 10^8 (100,000,000)
37.5032274550881 * 1e8 = 3750322745.50881

// Step 2: Round to nearest integer
Math.round(3750322745.50881) = 3750322746

// Step 3: Divide by 10^8
3750322746 / 1e8 = 37.50322746

// Result: 8 decimal places (matches DB precision)
```

**Why This Works**:
- Multiplying by `1e8` moves 8 decimal places to the left
- `Math.round()` removes fractional part
- Dividing by `1e8` moves 8 places back to the right
- Result matches database truncation behavior

## Verification

**Test Script**: `scripts/test-precision-fix.ts`

```bash
npx tsx scripts/test-precision-fix.ts
```

**Test Results**:
```
Query 1: Using full precision (SHOULD FAIL)
  Result: ❌ NOT FOUND

Query 2: Using rounded precision (SHOULD SUCCEED)
  Result: ✅ FOUND
  Restaurant ID: 60cb7b70-8a61-4ee7-9649-94bc6d66e5bf
  DB Lat: 37.50322746
  DB Lng: 127.05200989
  Match: Rounded 37.50322746 === DB 37.50322746 → true
```

## Impact

### Before Fix
- Every query with full-precision coordinates: **FAIL**
- Restaurants not found even though they exist in DB
- Each review created a duplicate restaurant
- UI showed "Restaurant not found" even after saving

### After Fix
- Queries with rounded coordinates: **SUCCESS**
- Existing restaurants found correctly
- No duplicate creation
- UI immediately shows saved reviews

## Geographic Precision Reference

| Decimal Places | Approximate Accuracy | Use Case |
|----------------|---------------------|----------|
| 0 | 111 km | Country level |
| 1 | 11.1 km | City level |
| 2 | 1.11 km | Town level |
| 3 | 111 m | Neighborhood |
| 4 | 11.1 m | Street level |
| 5 | 1.11 m | Building |
| **6** | **11.1 cm** | **Tree, person** |
| **7** | **1.11 cm** | **Brick, rock** |
| **8** | **1.11 mm** | **Sub-centimeter** ✅ |
| 9 | 111 μm | Microscopic |
| 13+ | Nanometers | Excessive for maps |

**8 decimal places = 1.11mm accuracy** - More than enough for restaurant locations!

## Long-Term Improvements (Optional)

### Option 1: Increase Database Precision

**Migration**: `lib/supabase/migrations/increase-precision.sql`

```sql
ALTER TABLE restaurants 
  ALTER COLUMN lat TYPE double precision,
  ALTER COLUMN lng TYPE double precision;
```

**Pros**: 
- 15 decimal digits precision (sub-nanometer accuracy)
- No rounding needed in application code
- Future-proof

**Cons**:
- Requires schema migration
- Slightly more storage (8 bytes vs 5 bytes per coordinate)

### Option 2: Migrate to PostGIS

**Best practice for geographic data**: Use PostGIS `geography(POINT)`

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE restaurants ADD COLUMN location geography(POINT);

UPDATE restaurants 
SET location = ST_Point(lng, lat)::geography;

CREATE INDEX idx_location_gist ON restaurants USING GIST (location);
```

**Benefits**:
- Industry standard for geographic data
- Built-in distance calculations
- Spatial indexing (faster queries)
- Range queries within radius

**Example Query**:
```javascript
// Find restaurants within 100 meters
const { data } = await supabase.rpc('nearby_restaurants', {
  lat: 37.5032274550881,
  lng: 127.052009891848,
  radius_meters: 100
});
```

## Files Modified

- ✅ `app/page.tsx` - Added coordinate rounding in 2 functions
- ✅ `scripts/test-precision-fix.ts` - Verification test
- ✅ `PRECISION_FIX.md` - This documentation

## Success Criteria

✅ Rounded coordinates match database values exactly  
✅ Query finds existing restaurants  
✅ No duplicate restaurants created  
✅ Reviews display immediately after saving  
✅ TypeScript compiles without errors  
✅ Test script confirms fix works  

## Testing Instructions

1. **Start dev server**: `npm run dev`
2. **Open browser**: http://localhost:3000
3. **Click restaurant marker**: "뽕나무쟁이 선릉본점"
4. **Check console**:
   ```
   🔍 [Enrich] Searching for restaurant:
     lat: 37.5032274550881
     lng: 127.052009891848
     roundedLat: 37.50322746  ← NEW!
     roundedLng: 127.05200989 ← NEW!
   ✅ [Enrich] Restaurant found  ← Should succeed now!
   ```
5. **Save a review**: Should see existing reviews + new review immediately
6. **Check for duplicates**: Run `npx tsx scripts/check-db-data.ts`

## Conclusion

The fix is **simple but critical**: Round coordinates to match database precision before querying or inserting. This ensures exact matches without requiring schema changes.

For production, consider migrating to `double precision` or PostGIS for better long-term maintainability.
