import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const envPath = join(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf-8')

const envVars: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=')
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim()
    }
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function cleanupDuplicates() {
  console.log('🔍 Finding duplicate restaurants...\n')

  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, lat, lng, created_at, avg_spice_level')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('❌ Error fetching restaurants:', error)
    return
  }

  interface Restaurant {
    id: string
    name: string
    lat: number
    lng: number
    created_at: string
    avg_spice_level: number | null
  }

  const groupedByKey: Record<string, Restaurant[]> = {}
  
  restaurants?.forEach((r) => {
    const key = `${r.name}|${r.lat}|${r.lng}`
    if (!groupedByKey[key]) {
      groupedByKey[key] = []
    }
    groupedByKey[key].push(r)
  })

  const duplicateGroups = Object.entries(groupedByKey).filter(([_, list]) => list.length > 1)

  console.log(`Found ${duplicateGroups.length} restaurant groups with duplicates:\n`)

  let totalDeleted = 0

  for (const [key, group] of duplicateGroups) {
    const [name] = key.split('|')
    console.log(`📍 ${name} - ${group.length} duplicates`)

    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, restaurant_id')
      .in('restaurant_id', group.map(r => r.id))

    if (reviewsError) {
      console.error('  ❌ Error fetching reviews:', reviewsError)
      continue
    }

    const reviewsByRestaurant: Record<string, number> = {}
    reviews?.forEach(r => {
      reviewsByRestaurant[r.restaurant_id] = (reviewsByRestaurant[r.restaurant_id] || 0) + 1
    })

    const keepRestaurant = group.sort((a, b) => {
      const aReviews = reviewsByRestaurant[a.id] || 0
      const bReviews = reviewsByRestaurant[b.id] || 0
      if (aReviews !== bReviews) return bReviews - aReviews
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })[0]

    console.log(`  ✅ Keeping: ${keepRestaurant.id} (${reviewsByRestaurant[keepRestaurant.id] || 0} reviews)`)

    const toDelete = group.filter(r => r.id !== keepRestaurant.id)
    
    for (const restaurant of toDelete) {
      const reviewCount = reviewsByRestaurant[restaurant.id] || 0
      
      if (reviewCount > 0) {
        console.log(`  🔄 Migrating ${reviewCount} reviews from ${restaurant.id}...`)
        const { error: updateError } = await supabase
          .from('reviews')
          .update({ restaurant_id: keepRestaurant.id })
          .eq('restaurant_id', restaurant.id)

        if (updateError) {
          console.error(`    ❌ Error migrating reviews:`, updateError)
          continue
        }
      }

      console.log(`  🗑️  Deleting: ${restaurant.id}`)
      const { error: deleteError } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', restaurant.id)

      if (deleteError) {
        console.error(`    ❌ Error deleting restaurant:`, deleteError)
      } else {
        totalDeleted++
      }
    }

    console.log(`  📊 Recalculating avg_spice_level for ${keepRestaurant.id}...`)
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('spice_level')
      .eq('restaurant_id', keepRestaurant.id)

    if (allReviews && allReviews.length > 0) {
      const avgLevel = allReviews.reduce((sum, r) => sum + r.spice_level, 0) / allReviews.length
      await supabase
        .from('restaurants')
        .update({ avg_spice_level: Math.round(avgLevel * 10) / 10 })
        .eq('id', keepRestaurant.id)
      
      console.log(`  ✅ Updated avg_spice_level: ${Math.round(avgLevel * 10) / 10}`)
    }

    console.log('')
  }

  console.log(`✨ Cleanup complete! Deleted ${totalDeleted} duplicate restaurants.`)
}

cleanupDuplicates()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
