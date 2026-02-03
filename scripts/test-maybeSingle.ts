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

async function testMaybeSingle() {
  const testName = '뽕나무쟁이 선릉본점'
  const testLat = 37.50322746
  const testLng = 127.05200989

  console.log('🔍 Testing .maybeSingle() with duplicate rows:\n')

  const result = await supabase
    .from('restaurants')
    .select('id, name, lat, lng')
    .eq('name', testName)
    .eq('lat', testLat)
    .eq('lng', testLng)
    .maybeSingle()

  console.log('Result:')
  console.log('  data:', result.data)
  console.log('  error:', result.error)
  console.log('')

  if (result.error) {
    console.log('❌ ERROR CODE:', result.error.code)
    console.log('❌ ERROR MESSAGE:', result.error.message)
    console.log('')
    console.log('This is why existingRestaurant is null!')
  }

  console.log('\n🔧 Fix: Use .limit(1).single() instead:\n')

  const fixedResult = await supabase
    .from('restaurants')
    .select('id, name, lat, lng')
    .eq('name', testName)
    .eq('lat', testLat)
    .eq('lng', testLng)
    .limit(1)
    .single()

  console.log('Result:')
  console.log('  data:', fixedResult.data)
  console.log('  error:', fixedResult.error)
  console.log('')

  if (fixedResult.data) {
    console.log('✅ Successfully found restaurant:', fixedResult.data.id)
  }
}

testMaybeSingle()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
