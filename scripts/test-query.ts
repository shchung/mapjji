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

async function testQuery() {
  const testName = '뽕나무쟁이 선릉본점'
  const testLat = 37.50322746
  const testLng = 127.05200989

  console.log('🔍 Testing query with exact values from DB:')
  console.log({
    name: testName,
    lat: testLat,
    lng: testLng,
    latType: typeof testLat,
    lngType: typeof testLng,
  })
  console.log('')

  console.log('Query 1: All three conditions (name + lat + lng)')
  const result1 = await supabase
    .from('restaurants')
    .select('id, name, lat, lng')
    .eq('name', testName)
    .eq('lat', testLat)
    .eq('lng', testLng)

  console.log('Result:', result1.data?.length || 0, 'rows')
  if (result1.data && result1.data.length > 0) {
    console.log('Found:', result1.data[0])
  }
  if (result1.error) {
    console.error('Error:', result1.error)
  }
  console.log('')

  console.log('Query 2: Name only')
  const result2 = await supabase
    .from('restaurants')
    .select('id, name, lat, lng')
    .eq('name', testName)

  console.log('Result:', result2.data?.length || 0, 'rows')
  if (result2.data && result2.data.length > 0) {
    result2.data.forEach((r, i) => {
      console.log(`  ${i + 1}.`, r.name, '- Lat:', r.lat, '- Lng:', r.lng)
      console.log('     Lat match:', r.lat === testLat, '(DB:', typeof r.lat, 'vs Test:', typeof testLat, ')')
      console.log('     Lng match:', r.lng === testLng, '(DB:', typeof r.lng, 'vs Test:', typeof testLng, ')')
    })
  }
  console.log('')

  console.log('Query 3: Using parseFloat on lat/lng before query')
  const parsedLat = parseFloat(String(testLat))
  const parsedLng = parseFloat(String(testLng))
  console.log('Parsed values:', { parsedLat, parsedLng })
  const result3 = await supabase
    .from('restaurants')
    .select('id, name, lat, lng')
    .eq('name', testName)
    .eq('lat', parsedLat)
    .eq('lng', parsedLng)

  console.log('Result:', result3.data?.length || 0, 'rows')
  if (result3.data && result3.data.length > 0) {
    console.log('Found:', result3.data[0])
  }
  console.log('')
}

testQuery()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
