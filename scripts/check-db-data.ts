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

async function checkDatabaseData() {
  console.log('🔍 Checking Supabase database data...\n')

  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, lat, lng, address, phone, avg_spice_level, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('❌ Error fetching restaurants:', error)
    return
  }

  console.log(`📊 Found ${restaurants?.length || 0} restaurants (showing 10 most recent):\n`)

  restaurants?.forEach((r, i) => {
    console.log(`${i + 1}. ${r.name}`)
    console.log(`   ID: ${r.id}`)
    console.log(`   Lat: ${r.lat} (type: ${typeof r.lat})`)
    console.log(`   Lng: ${r.lng} (type: ${typeof r.lng})`)
    console.log(`   Address: ${r.address || 'N/A'}`)
    console.log(`   Phone: ${r.phone || 'N/A'}`)
    console.log(`   Avg Spice: ${r.avg_spice_level || 'N/A'}`)
    console.log(`   Created: ${r.created_at}`)
    console.log('')
  })

  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('id, restaurant_id, spice_level, comment, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  if (reviewsError) {
    console.error('❌ Error fetching reviews:', reviewsError)
    return
  }

  console.log(`📝 Found ${reviews?.length || 0} reviews (showing 10 most recent):\n`)

  reviews?.forEach((r, i) => {
    console.log(`${i + 1}. Restaurant ID: ${r.restaurant_id}`)
    console.log(`   Spice Level: ${r.spice_level}`)
    console.log(`   Comment: ${r.comment || 'N/A'}`)
    console.log(`   Created: ${r.created_at}`)
    console.log('')
  })

  const restaurantsByName: Record<string, any[]> = {}
  restaurants?.forEach(r => {
    if (!restaurantsByName[r.name]) {
      restaurantsByName[r.name] = []
    }
    restaurantsByName[r.name].push(r)
  })

  const duplicates = Object.entries(restaurantsByName).filter(([_, list]) => list.length > 1)

  if (duplicates.length > 0) {
    console.log('⚠️  Found duplicate restaurant names:\n')
    duplicates.forEach(([name, list]) => {
      console.log(`"${name}" - ${list.length} entries:`)
      list.forEach(r => {
        console.log(`  - ID: ${r.id}, Lat: ${r.lat}, Lng: ${r.lng}`)
      })
      console.log('')
    })
  } else {
    console.log('✅ No duplicate restaurant names found')
  }
}

checkDatabaseData()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
