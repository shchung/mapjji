import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function findNearbyRestaurants(
  lat: number,
  lng: number,
  radiusMeters: number = 100
) {
  const { data, error } = await supabase.rpc('nearby_restaurants', {
    search_lat: lat,
    search_lng: lng,
    radius_meters: radiusMeters,
  })

  if (error) {
    console.error('Error finding nearby restaurants:', error)
    return []
  }

  return data
}

export async function getOrCreateRestaurantByLocation(
  name: string,
  lat: number,
  lng: number,
  address?: string,
  phone?: string,
  toleranceMeters: number = 10
) {
  const { data, error } = await supabase.rpc('get_or_create_restaurant_by_location', {
    search_name: name,
    search_lat: lat,
    search_lng: lng,
    search_address: address,
    search_phone: phone,
    tolerance_meters: toleranceMeters,
  })

  if (error) {
    console.error('Error getting/creating restaurant:', error)
    return null
  }

  return data
}

export async function getRestaurantWithinRadius(
  name: string,
  lat: number,
  lng: number,
  radiusMeters: number = 10
) {
  const { data, error } = await supabase.rpc('nearby_restaurants', {
    search_lat: lat,
    search_lng: lng,
    radius_meters: radiusMeters,
  })

  if (error) {
    console.error('Error searching restaurants:', error)
    return null
  }

  const match = data?.find((r: any) => r.name === name)
  return match || null
}

export async function insertRestaurantWithLocation(
  name: string,
  lat: number,
  lng: number,
  address?: string,
  phone?: string
) {
  const { data, error } = await supabase
    .from('restaurants')
    .insert({
      name,
      location: `POINT(${lng} ${lat})`,
      address,
      phone,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error inserting restaurant:', error)
    return null
  }

  return data.id
}

export async function searchRestaurantsByProximity(
  searchTerm: string,
  userLat: number,
  userLng: number,
  maxDistanceMeters: number = 5000
) {
  const { data, error } = await supabase.rpc('nearby_restaurants', {
    search_lat: userLat,
    search_lng: userLng,
    radius_meters: maxDistanceMeters,
  })

  if (error) {
    console.error('Error searching:', error)
    return []
  }

  return data?.filter((r: any) => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []
}
