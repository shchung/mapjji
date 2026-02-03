# 🐛 Bug Fix Summary - Review Display Issue

## Problem Identified

**Issue**: Reviews were saving to the database but not appearing in the UI when clicking a restaurant marker.

### Root Cause

Using `.maybeSingle()` with duplicate restaurant entries:
- `.maybeSingle()` expects 0 or 1 row
- When finding multiple duplicates, it returns error `PGRST116` instead of data
- Code interpreted error as "restaurant not found"
- Each new review created a NEW duplicate restaurant

**Example**: "뽕나무쟁이 선릉본점" had **7 duplicate entries** in the database!

## Solution Applied

### 1. Fixed Query Method (✅ Applied)

**Changed**: All `.maybeSingle()` calls to `.limit(1).maybeSingle()`

**Files Modified**:
- `app/page.tsx`
  - `enrichPlaceWithDbData()` - lines 526-575 (2 queries fixed)
  - `getOrCreateRestaurant()` - lines 642-667 (2 queries fixed)

**Why**: `.limit(1)` ensures we only fetch 1 row maximum, so `.maybeSingle()` never encounters the "multiple rows" error.

### 2. Enhanced Debugging (✅ Applied)

**Added detailed logging**:
```typescript
console.log('🔍 [Enrich] Fallback search params:', { name, lat, lng, latType, lngType })
console.log('🔍 [Enrich] Fallback search result:', { found, data, error })
console.log('🆕 [GetOrCreate] Creating new restaurant with data:', { name, lat, lng, ... })
```

**Location**: `app/page.tsx` lines 540-577, 654-715

### 3. Database Cleanup Required (⚠️ USER ACTION NEEDED)

**Current State**: 7 duplicate "뽕나무쟁이 선릉본점" restaurants with scattered reviews

**Action Required**: Run SQL migration in Supabase Dashboard

**File**: `lib/supabase/migrations/cleanup-duplicates.sql`

**What it does**:
1. Migrates all reviews to the oldest restaurant for each duplicate group
2. Deletes duplicate restaurant entries
3. Recalculates `avg_spice_level` for all restaurants
4. Adds `UNIQUE INDEX` on (name, lat, lng) to prevent future duplicates

**How to run**:
1. Go to Supabase Dashboard → SQL Editor
2. Open a new query
3. Copy/paste contents of `cleanup-duplicates.sql`
4. Click "Run"

## Verification

### Before Fix
```
User saves review
  ↓
getOrCreateRestaurant()
  ├─ Search: .eq('name').eq('lat').eq('lng').maybeSingle()
  ├─ Finds 7 rows → .maybeSingle() returns ERROR
  ├─ Error treated as "not found"
  └─ Creates 8th duplicate! ❌
  ↓
enrichPlaceWithDbData()
  ├─ Same search → Same error
  └─ Returns place without reviews ❌
```

### After Fix
```
User saves review
  ↓
getOrCreateRestaurant()
  ├─ Search: .eq('name').eq('lat').eq('lng').limit(1).maybeSingle()
  ├─ Finds 1 row → Returns existing restaurant ✅
  └─ Adds review to existing restaurant ✅
  ↓
enrichPlaceWithDbData()
  ├─ Same search → Finds restaurant ✅
  └─ Returns place WITH all reviews ✅
```

## Diagnostic Scripts Created

### `scripts/check-db-data.ts`
Shows current database state:
- Lists all restaurants with lat/lng/avg_spice_level
- Shows all recent reviews
- Identifies duplicate restaurant entries

**Run**: `npx tsx scripts/check-db-data.ts`

### `scripts/test-query.ts`
Tests exact query behavior:
- Verifies `.eq()` queries work correctly
- Compares different query approaches

**Run**: `npx tsx scripts/test-query.ts`

### `scripts/test-maybeSingle.ts`
Demonstrates the `.maybeSingle()` bug:
- Shows error when multiple rows exist
- Proves `.limit(1).maybeSingle()` fixes it

**Run**: `npx tsx scripts/test-maybeSingle.ts`

### `scripts/cleanup-duplicates.ts` (Failed - RLS permissions)
Attempted programmatic cleanup but failed due to Row Level Security.
Use SQL migration instead (see above).

## Testing Instructions

After running the SQL cleanup migration:

1. **Start dev server**: `npm run dev`
2. **Open**: http://localhost:3000
3. **Click any restaurant marker**
4. **Click**: "맵기 레벨 등록하기"
5. **Select spice level** and optional comment
6. **Click**: "등록하기"
7. **Expected Result**:
   - ✅ Toast shows "저장되었습니다"
   - ✅ Review appears immediately in BottomSheet
   - ✅ Console shows: `✅ [Enrich] Restaurant found`
   - ✅ No duplicate restaurants created
8. **Click away and back**:
   - ✅ Review still displays
   - ✅ Spice level shows in marker

## Next Steps (Optional Improvements)

### 1. Add `kakao_place_id` Column (Recommended)
More reliable than name/lat/lng matching:

**Run**: `lib/supabase/migrations/add_kakao_place_id.sql`

### 2. Add Loading States
```tsx
const [isLoadingReviews, setIsLoadingReviews] = useState(false)
```

### 3. Add Empty State
```tsx
{reviews.length === 0 && (
  <p className="text-sm text-zinc-500">아직 리뷰가 없습니다</p>
)}
```

### 4. Add Retry Button
```tsx
{!restaurant && (
  <button onClick={() => enrichPlaceWithDbData(place)}>
    다시 불러오기
  </button>
)}
```

## Files Changed

### Modified
- `app/page.tsx` - Fixed `.maybeSingle()` queries, added debugging

### Created
- `scripts/check-db-data.ts` - Database inspection tool
- `scripts/test-query.ts` - Query behavior test
- `scripts/test-maybeSingle.ts` - Bug demonstration
- `scripts/cleanup-duplicates.ts` - Failed cleanup attempt (RLS blocked)
- `lib/supabase/migrations/cleanup-duplicates.sql` - Manual cleanup SQL
- `BUGFIX_SUMMARY.md` - This document

## Success Criteria

✅ Code fixed: `.limit(1).maybeSingle()` prevents duplicate creation
⚠️ Data cleanup pending: User must run SQL migration
✅ Debugging enhanced: Detailed logs for future troubleshooting
✅ Prevention: UNIQUE INDEX will block future duplicates (after migration)

## Estimated Impact

- **Before**: Every review created a duplicate restaurant
- **After**: Reviews properly link to existing restaurants
- **Database**: Will reduce from ~17 restaurants to ~11 (after cleanup)
- **Performance**: Faster queries, less duplicate data
