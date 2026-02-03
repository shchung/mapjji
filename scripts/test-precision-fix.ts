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

async function testPrecisionFix() {
  const testName = '뽕나무쟁이 선릉본점'
  const fullPrecisionLat = 37.5032274550881
  const fullPrecisionLng = 127.052009891848
  
  const roundedLat = Math.round(fullPrecisionLat * 1e8) / 1e8
  const roundedLng = Math.round(fullPrecisionLng * 1e8) / 1e8

  console.log('🔍 Testing precision fix:\n')
  console.log('Original values (from Kakao Maps):')
  console.log(`  Lat: ${fullPrecisionLat} (${fullPrecisionLat.toString().split('.')[1]?.length || 0} decimals)`)
  console.log(`  Lng: ${fullPrecisionLng} (${fullPrecisionLng.toString().split('.')[1]?.length || 0} decimals)`)
  console.log('')
  console.log('Rounded values (for DB matching):')
  console.log(`  Lat: ${roundedLat} (${roundedLat.toString().split('.')[1]?.length || 0} decimals)`)
  console.log(`  Lng: ${roundedLng} (${roundedLng.toString().split('.')[1]?.length || 0} decimals)`)
  console.log('')

  console.log('Query 1: Using full precision (SHOULD FAIL)')
  const result1 = await supabase
    .from('restaurants')
    .select('id, name, lat, lng')
    .eq('name', testName)
    .eq('lat', fullPrecisionLat)
    .eq('lng', fullPrecisionLng)
    .limit(1)
    .maybeSingle()

  console.log(`  Result: ${result1.data ? '✅ FOUND' : '❌ NOT FOUND'}`)
  if (result1.data) {
    console.log(`  Unexpected! Full precision matched.`)
  }
  console.log('')

  console.log('Query 2: Using rounded precision (SHOULD SUCCEED)')
  const result2 = await supabase
    .from('restaurants')
    .select('id, name, lat, lng')
    .eq('name', testName)
    .eq('lat', roundedLat)
    .eq('lng', roundedLng)
    .limit(1)
    .maybeSingle()

  console.log(`  Result: ${result2.data ? '✅ FOUND' : '❌ NOT FOUND'}`)
  if (result2.data) {
    console.log(`  Restaurant ID: ${result2.data.id}`)
    console.log(`  DB Lat: ${result2.data.lat}`)
    console.log(`  DB Lng: ${result2.data.lng}`)
    console.log(`  Match: Rounded ${roundedLat} === DB ${result2.data.lat} → ${roundedLat === result2.data.lat}`)
  } else {
    console.log(`  ❌ Still not found! Check database state.`)
  }
  console.log('')

  console.log('Verification: What\'s actually in the database?')
  const result3 = await supabase
    .from('restaurants')
    .select('id, name, lat, lng')
    .eq('name', testName)
    .limit(1)

  if (result3.data && result3.data.length > 0) {
    const dbRecord = result3.data[0]
    console.log(`  DB Name: ${dbRecord.name}`)
    console.log(`  DB Lat: ${dbRecord.lat}`)
    console.log(`  DB Lng: ${dbRecord.lng}`)
    console.log('')
    console.log('Comparison:')
    console.log(`  Rounded lat matches DB: ${roundedLat === dbRecord.lat}`)
    console.log(`  Rounded lng matches DB: ${roundedLng === dbRecord.lng}`)
    console.log(`  Full lat matches DB: ${fullPrecisionLat === dbRecord.lat}`)
    console.log(`  Full lng matches DB: ${fullPrecisionLng === dbRecord.lng}`)
  }
}

testPrecisionFix()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
