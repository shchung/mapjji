'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { KakaoMapProvider } from '@/components/map/KakaoMapScript'
import { KakaoMap } from '@/components/map/KakaoMap'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { SpiceLevelForm } from '@/components/ui/SpiceLevelForm'
import { ReviewCard } from '@/components/ui/ReviewCard'
import { DisambiguationMenu } from '@/components/ui/DisambiguationMenu'
import { MapInstructionHint } from '@/components/ui/MapInstructionHint'
import { AuthModal } from '@/components/auth/AuthModal'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import type { KakaoPlace } from '@/app/api/search/route'

interface Review {
  id: string
  spice_level: number
  comment: string | null
  created_at: string
  user_id: string
}

interface SearchResult extends KakaoPlace {
  lat: number
  lng: number
  avg_spice_level?: number | null
  review_count?: number
  restaurant_id?: string
  reviews?: Review[]
}

type SelectedPlace = SearchResult | null

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export default function Home() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [mapInstance, setMapInstance] = useState<KakaoMapInstance | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isSpiceFormOpen, setIsSpiceFormOpen] = useState(false)
  const [viewportRestaurants, setViewportRestaurants] = useState<SearchResult[]>([])
  const [disambiguationCandidates, setDisambiguationCandidates] = useState<SearchResult[]>([])
  const [disambiguationPosition, setDisambiguationPosition] = useState<{ x: number; y: number } | null>(null)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [isLoadingNearby, setIsLoadingNearby] = useState(false)

  const searchMarkersRef = useRef<KakaoCustomOverlay[]>([])
  const viewportMarkersRef = useRef<KakaoCustomOverlay[]>([])
  const viewportRestaurantsRef = useRef<SearchResult[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const idleDebounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const { user, isLoading: isAuthLoading } = useAuth()
  const { showToast } = useToast()
  const supabase = createClient()

  const debouncedQuery = useDebounce(searchQuery, 300)

  const enrichPlaceWithDbData = useCallback(
    async (place: SearchResult): Promise<SearchResult> => {
      const { lat, lng } = place
      const roundedLat = Math.round(lat * 1e8) / 1e8
      const roundedLng = Math.round(lng * 1e8) / 1e8
      const name = 'place_name' in place ? place.place_name : ''

      console.log('🔍 [Enrich] Searching for restaurant:', { name, lat, lng, roundedLat, roundedLng })

      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id, name, avg_spice_level')
        .eq('name', name)
        .eq('lat', roundedLat)
        .eq('lng', roundedLng)
        .limit(1)
        .maybeSingle()

      if (restaurantError) {
        console.error('❌ [Enrich] Error fetching restaurant:', restaurantError)
        return place
      }

      if (!restaurant) {
        console.log('🔍 [Enrich] Fallback search params:', { name, roundedLat, roundedLng })
        const { data: fallbackRestaurant, error: fallbackError } = await supabase
          .from('restaurants')
          .select('id, name, avg_spice_level')
          .eq('name', name)
          .limit(1)
          .maybeSingle()

        if (fallbackError) {
          console.error('❌ [Enrich] Fallback search error:', fallbackError)
          return place
        }

        if (!fallbackRestaurant) {
          console.log('⚠️ [Enrich] Restaurant not found in DB')
          return place
        }

        console.log('✅ [Enrich] Restaurant found via fallback:', fallbackRestaurant.id)
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('id, spice_level, comment, created_at, user_id')
          .eq('restaurant_id', fallbackRestaurant.id)
          .order('created_at', { ascending: false })

        if (reviewsError) {
          console.error('❌ [Enrich] Error fetching reviews:', reviewsError)
        }

        return {
          ...place,
          restaurant_id: fallbackRestaurant.id,
          avg_spice_level: fallbackRestaurant.avg_spice_level,
          review_count: reviews?.length || 0,
          reviews: reviews || [],
        }
      }

      console.log('✅ [Enrich] Restaurant found:', restaurant.id)
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, spice_level, comment, created_at, user_id')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })

      if (reviewsError) {
        console.error('❌ [Enrich] Error fetching reviews:', reviewsError)
      }

      return {
        ...place,
        restaurant_id: restaurant.id,
        avg_spice_level: restaurant.avg_spice_level,
        review_count: reviews?.length || 0,
        reviews: reviews || [],
      }
    },
    [supabase]
  )

  const fetchRestaurantsInBounds = useCallback(
    async (bounds: { sw: { lat: number; lng: number }; ne: { lat: number; lng: number } }): Promise<SearchResult[]> => {
      try {
        const latDiff = bounds.ne.lat - bounds.sw.lat
        const lngDiff = bounds.ne.lng - bounds.sw.lng
        
        const gridCenters = []
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            gridCenters.push({
              lat: bounds.sw.lat + latDiff * ((row + 0.5) / 3),
              lng: bounds.sw.lng + lngDiff * ((col + 0.5) / 3),
            })
          }
        }

        const gridRadius = Math.min(
          Math.sqrt(
            Math.pow((latDiff / 3) * 111000, 2) +
            Math.pow((lngDiff / 3) * 88000, 2)
          ),
          20000
        )

        console.log(`🌐 [FetchBounds] Fetching from 9 grid points (3x3), radius: ${gridRadius.toFixed(0)}m each`)

        const gridResults = await Promise.all(
          gridCenters.map(async (center, index) => {
            console.log(`  📍 Grid ${index + 1}: (${center.lat.toFixed(5)}, ${center.lng.toFixed(5)})`)
            
            const response = await fetch(
              `/api/restaurants/nearby?x=${center.lng}&y=${center.lat}&radius=${Math.round(gridRadius)}`
            )

            if (!response.ok) {
              console.error(`❌ Grid ${index + 1} API error:`, response.status)
              return []
            }

            const data = await response.json()
            return data.places.map((place: KakaoPlace) => ({
              ...place,
              lat: parseFloat(place.y),
              lng: parseFloat(place.x),
            }))
          })
        )

        const allResults = gridResults.flat()
        
        const uniqueResults = Array.from(
          new Map(allResults.map(place => [place.id, place])).values()
        )

        console.log(`✅ [FetchBounds] Total: ${allResults.length} results, Unique: ${uniqueResults.length} (removed ${allResults.length - uniqueResults.length} duplicates)`)

        const enrichedResults = await Promise.all(
          uniqueResults.map((result) => enrichPlaceWithDbData(result))
        )

        return enrichedResults
      } catch (error) {
        console.error('❌ [FetchBounds] Unexpected error:', error)
        return []
      }
    },
    [enrichPlaceWithDbData]
  )

  const getOrCreateRestaurant = useCallback(
    async (place: SearchResult): Promise<string | null> => {
      const roundedLat = Math.round(place.lat * 1e8) / 1e8
      const roundedLng = Math.round(place.lng * 1e8) / 1e8
      const name = 'place_name' in place ? place.place_name : ''
      const address = 'road_address_name' in place ? (place.road_address_name || place.address_name || '') : ''
      const phone = 'phone' in place ? (place.phone || '') : ''

      console.log('🔍 [GetOrCreate] Searching for restaurant:', { name, roundedLat, roundedLng })

      const { data: existing, error: searchError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('name', name)
        .eq('lat', roundedLat)
        .eq('lng', roundedLng)
        .limit(1)
        .maybeSingle()

      if (searchError) {
        console.error('❌ [GetOrCreate] Search error:', searchError)
        return null
      }

      if (existing) {
        console.log('✅ [GetOrCreate] Found existing restaurant:', existing.id)
        return existing.id
      }

      console.log('🆕 [GetOrCreate] Creating new restaurant with data:', { name, roundedLat, roundedLng, address, phone })
      const { data: newRestaurant, error: insertError } = await supabase
        .from('restaurants')
        .insert({
          name,
          lat: roundedLat,
          lng: roundedLng,
          address,
          phone,
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('❌ [GetOrCreate] Insert error:', insertError)
        return null
      }

      console.log('✅ [GetOrCreate] Created new restaurant:', newRestaurant.id)
      return newRestaurant.id
    },
    [supabase]
  )

  const updateRestaurantAvgSpiceLevel = useCallback(
    async (restaurantId: string) => {
      const { data: reviews, error: fetchError } = await supabase
        .from('reviews')
        .select('spice_level')
        .eq('restaurant_id', restaurantId)

      if (fetchError) {
        console.error('❌ [UpdateAvg] Error fetching reviews:', fetchError)
        return
      }

      if (!reviews || reviews.length === 0) {
        await supabase
          .from('restaurants')
          .update({ avg_spice_level: null })
          .eq('id', restaurantId)
        return
      }

      const sum = reviews.reduce((acc, r) => acc + r.spice_level, 0)
      const avg = Math.round((sum / reviews.length) * 10) / 10

      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ avg_spice_level: avg })
        .eq('id', restaurantId)

      if (updateError) {
        console.error('❌ [UpdateAvg] Error updating avg:', updateError)
      } else {
        console.log('✅ [UpdateAvg] Updated avg_spice_level to:', avg)
      }
    },
    [supabase]
  )

  const handleSpiceLevelSubmit = useCallback(
    async (spiceLevel: number, comment: string) => {
      if (!user || !selectedPlace || !('place_name' in selectedPlace)) {
        showToast('로그인이 필요합니다', 'error')
        return
      }

      try {
        const restaurantId = await getOrCreateRestaurant(selectedPlace)
        if (!restaurantId) {
          showToast('식당 정보를 저장할 수 없습니다', 'error')
          return
        }

        const { error: reviewError } = await supabase.from('reviews').insert({
          restaurant_id: restaurantId,
          user_id: user.id,
          spice_level: spiceLevel,
          comment: comment || null,
        })

        if (reviewError) {
          console.error('❌ [Submit] Review insert error:', reviewError)
          showToast('리뷰 저장에 실패했습니다', 'error')
          return
        }

        await updateRestaurantAvgSpiceLevel(restaurantId)

        const enrichedPlace = await enrichPlaceWithDbData(selectedPlace)
        setSelectedPlace(enrichedPlace)

        setIsSpiceFormOpen(false)
        showToast('저장되었습니다! 🌶️', 'success')
      } catch (error) {
        console.error('❌ [Submit] Unexpected error:', error)
        showToast('오류가 발생했습니다', 'error')
      }
    },
    [user, selectedPlace, getOrCreateRestaurant, updateRestaurantAvgSpiceLevel, enrichPlaceWithDbData, supabase, showToast]
  )

  const handleAddSpiceLevelClick = useCallback(() => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    setIsSpiceFormOpen(true)
  }, [user])

  const handleMarkerClick = useCallback(
    async (place: SearchResult) => {
      console.log('🖱️ [MarkerClick] Clicked place:', place)
      try {
        setIsLoadingReviews(true)
        const enrichedPlace = await enrichPlaceWithDbData(place)
        console.log('✅ [MarkerClick] Enriched place:', enrichedPlace)
        setSelectedPlace(enrichedPlace)
        setIsLoadingReviews(false)
      } catch (error) {
        console.error('❌ [MarkerClick] Error:', error)
        showToast('식당 정보를 불러올 수 없습니다', 'error')
        setIsLoadingReviews(false)
      }
    },
    [enrichPlaceWithDbData, showToast]
  )

  const clearSearchMarkers = useCallback(() => {
    searchMarkersRef.current.forEach((overlay) => overlay.setMap(null))
    searchMarkersRef.current = []
  }, [])

  const clearViewportMarkers = useCallback(() => {
    viewportMarkersRef.current.forEach((overlay) => overlay.setMap(null))
    viewportMarkersRef.current = []
  }, [])

  const createViewportMarkers = useCallback(
    (results: SearchResult[], map: KakaoMapInstance) => {
      if (!window.kakao?.maps) return

      console.log(`🔷 [ViewportMarkers] Creating ${results.length} transparent markers`)

      results.forEach((place) => {
        const markerContent = document.createElement('div')
        markerContent.style.cursor = 'pointer'
        markerContent.style.pointerEvents = 'auto'
        markerContent.style.zIndex = '100'
        markerContent.innerHTML = `
          <div style="
            width: 50px;
            height: 50px;
            opacity: 0.01;
            cursor: pointer;
            pointer-events: auto;
            background: transparent;
          "></div>
        `

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(place.lat, place.lng),
          content: markerContent,
          yAnchor: 1,
          zIndex: 100,
        })

        customOverlay.setMap(map)
        viewportMarkersRef.current.push(customOverlay)

        markerContent.addEventListener('click', (e) => {
          console.log('🎯 [ViewportMarker] Clicked:', place.place_name)
          e.stopPropagation()
          handleMarkerClick(place)
        })
      })

      console.log(`✅ [ViewportMarkers] Successfully created ${results.length} transparent markers`)
    },
    [handleMarkerClick]
  )

  const createSearchMarkers = useCallback(
    (results: SearchResult[], map: KakaoMapInstance) => {
      if (!window.kakao?.maps) return

      console.log(`🏷️ [CreateMarkers] Creating ${results.length} markers`)

      results.forEach((place) => {
        const hasReviews = place.review_count && place.review_count > 0
        const avgLevel = place.avg_spice_level || 0
        const bgColor = hasReviews
          ? avgLevel <= 2
            ? '#10b981'
            : avgLevel <= 3
              ? '#f59e0b'
              : '#ef4444'
          : '#3b82f6'

        const markerContent = document.createElement('div')
        markerContent.style.cursor = 'pointer'
        markerContent.style.pointerEvents = 'auto'
        markerContent.style.zIndex = '1000'
        markerContent.innerHTML = `
          <div style="
            width: 36px;
            height: 36px;
            background: ${bgColor};
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            cursor: pointer;
            pointer-events: auto;
          ">
            ${hasReviews ? '🌶️' : '🍽️'}
          </div>
        `

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(place.lat, place.lng),
          content: markerContent,
          yAnchor: 1,
          zIndex: 100,
        })

        customOverlay.setMap(map)
        searchMarkersRef.current.push(customOverlay)

        markerContent.addEventListener('click', (e) => {
          console.log('🎯 [MarkerClick] Raw click event fired for:', place.place_name)
          e.stopPropagation()
          handleMarkerClick(place)
        })
      })

      console.log(`✅ [CreateMarkers] Successfully created ${results.length} markers`)
    },
    [handleMarkerClick]
  )

  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([])
        clearSearchMarkers()
        return
      }

      setIsSearching(true)
      setSearchError(null)

      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`)

        if (!response.ok) {
          const errorMessage = response.status === 429
            ? 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요'
            : response.status === 500
              ? '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요'
              : response.status === 503
                ? '서비스를 일시적으로 사용할 수 없습니다'
                : '검색에 실패했습니다'
          throw new Error(errorMessage)
        }

        const data = await response.json()

        const results: SearchResult[] = data.places.map((place: KakaoPlace) => ({
          ...place,
          lat: parseFloat(place.y),
          lng: parseFloat(place.x),
        }))

        const enrichedResults = await Promise.all(
          results.map((result) => enrichPlaceWithDbData(result))
        )

        setSearchResults(enrichedResults)
        clearSearchMarkers()

        if (mapInstance && enrichedResults.length > 0) {
          createSearchMarkers(enrichedResults, mapInstance)

          const firstResult = enrichedResults[0]
          const position = new window.kakao.maps.LatLng(firstResult.lat, firstResult.lng)
          mapInstance.panTo(position)
          mapInstance.setLevel(5)
        }
      } catch (error) {
        console.error('[Search] Error:', error)
        const errorMessage = error instanceof TypeError && error.message.includes('fetch')
          ? '네트워크 연결을 확인해주세요'
          : error instanceof Error
            ? error.message
            : '검색에 실패했습니다. 다시 시도해주세요'
        setSearchError(errorMessage)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    },
    [mapInstance, enrichPlaceWithDbData]
  )

  useEffect(() => {
    viewportRestaurantsRef.current = viewportRestaurants
  }, [viewportRestaurants])

  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery)
    } else {
      setSearchResults([])
      clearSearchMarkers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery])



  const handleBoundsChanged = useCallback(
    async (bounds: { sw: { lat: number; lng: number }; ne: { lat: number; lng: number } }) => {
      if (idleDebounceTimerRef.current) {
        clearTimeout(idleDebounceTimerRef.current)
      }

      idleDebounceTimerRef.current = setTimeout(async () => {
        console.log('🗺️ [BoundsChanged] Map idle, fetching viewport restaurants...')
        
        try {
          const newRestaurants = await fetchRestaurantsInBounds(bounds)
          console.log(`✅ [BoundsChanged] Fetched ${newRestaurants.length} restaurants`)
          
          setViewportRestaurants(newRestaurants)
          viewportRestaurantsRef.current = newRestaurants
          
          if (mapInstance) {
            clearViewportMarkers()
            createViewportMarkers(newRestaurants, mapInstance)
          }
        } catch (error) {
          console.error('❌ [BoundsChanged] Error fetching restaurants:', error)
        }
      }, 100)
    },
    [fetchRestaurantsInBounds, mapInstance, clearViewportMarkers, createViewportMarkers]
  )

  const handleMapReady = useCallback(
    async (map: KakaoMapInstance) => {
      console.log('[Home] Map ready')
      setMapInstance(map)

      const bounds = map.getBounds()
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      const initialBounds = {
        sw: { lat: sw.getLat(), lng: sw.getLng() },
        ne: { lat: ne.getLat(), lng: ne.getLng() },
      }

      console.log('🔍 [MapReady] Fetching initial viewport restaurants with grid search...')
      const initialRestaurants = await fetchRestaurantsInBounds(initialBounds)
      console.log(`✅ [MapReady] Fetched ${initialRestaurants.length} restaurants`)
      setViewportRestaurants(initialRestaurants)
      clearViewportMarkers()
      createViewportMarkers(initialRestaurants, map)

      window.kakao.maps.event.addListener(map, 'click', async (mouseEvent: any) => {
        const latlng = mouseEvent.latLng
        const clickLat = latlng.getLat()
        const clickLng = latlng.getLng()
        const zoomLevel = map.getLevel()

        let searchRadius: number
        let showMenu: boolean

        if (zoomLevel === 1) {
          searchRadius = 10
          showMenu = true
        } else if (zoomLevel === 2) {
          searchRadius = 20
          showMenu = true
        } else if (zoomLevel === 3) {
          searchRadius = 40
          showMenu = true
        } else if (zoomLevel === 4) {
          searchRadius = 80
          showMenu = true
        } else if (zoomLevel <= 6) {
          searchRadius = 150
          showMenu = false
        } else if (zoomLevel <= 8) {
          searchRadius = 300
          showMenu = false
        } else {
          searchRadius = 500
          showMenu = false
        }

        console.log('🖱️ [MapClick] Clicked at:', clickLat, clickLng, `| Zoom: ${zoomLevel} | Radius: ${searchRadius}m | Menu: ${showMenu}`)
        console.log('🔍 [MapClick] Filtering nearby restaurants from viewport data...')

        try {
          const nearbyRestaurants = viewportRestaurantsRef.current
            .map(restaurant => {
              const distance = calculateDistance(clickLat, clickLng, restaurant.lat, restaurant.lng)
              return { ...restaurant, distance: distance.toString() }
            })
            .filter(restaurant => parseFloat(restaurant.distance) <= searchRadius)
            .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))

          if (nearbyRestaurants.length === 0) {
            console.log('⚠️ [MapClick] No restaurants found nearby')
            showToast('근처에 식당이 없습니다', 'info')
            return
          }

          console.log(`📍 [MapClick] Found ${nearbyRestaurants.length} nearby restaurants`)

          if (showMenu && nearbyRestaurants.length > 1) {
            console.log(`🔍 [MapClick] Showing disambiguation menu with ${nearbyRestaurants.length} options (sorted by distance)`)
            setDisambiguationCandidates(nearbyRestaurants)
          } else {
            console.log(`✅ [MapClick] Auto-selecting nearest: ${nearbyRestaurants[0].place_name} (${nearbyRestaurants[0].distance}m away)`)
            handleMarkerClick(nearbyRestaurants[0])
          }
        } catch (error) {
          console.error('❌ [MapClick] Error:', error)
          showToast('오류가 발생했습니다. 다시 시도해주세요', 'error')
        }
      })
    },
    [enrichPlaceWithDbData, handleMarkerClick, showToast, clearViewportMarkers, createViewportMarkers, fetchRestaurantsInBounds]
  )

  const handleResultClick = useCallback(
    async (result: SearchResult) => {
      if (!mapInstance || !window.kakao?.maps) return

      const position = new window.kakao.maps.LatLng(result.lat, result.lng)
      mapInstance.panTo(position)
      mapInstance.setLevel(3)

      handleMarkerClick(result)
    },
    [mapInstance, handleMarkerClick]
  )

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults([])
    setSearchError(null)
    clearSearchMarkers()
    setIsSearchOpen(false)
  }, [clearSearchMarkers])

  const handleDisambiguationSelect = useCallback(
    async (restaurant: SearchResult) => {
      setDisambiguationCandidates([])
      handleMarkerClick(restaurant)
    },
    [handleMarkerClick]
  )

  const getSpiceLevelColor = (level: number | null | undefined) => {
    if (!level) return 'text-zinc-400'
    if (level <= 2) return 'text-emerald-400'
    if (level === 3) return 'text-amber-400'
    return 'text-red-400'
  }

  const getSpiceLevelLabel = (level: number | null | undefined) => {
    if (!level) return '정보 없음'
    if (level === 1) return '순한맛'
    if (level === 2) return '약간 매운맛'
    if (level === 3) return '보통 매운맛'
    if (level === 4) return '매운맛'
    return '극강 매운맛'
  }

  const handleCurrentLocationClick = useCallback(() => {
    console.log('📍 [CurrentLocation] Button clicked')

    if (!mapInstance || !window.kakao?.maps) {
      console.log('❌ [CurrentLocation] Map not ready')
      showToast('지도가 준비되지 않았습니다', 'error')
      return
    }

    if (!navigator.geolocation) {
      console.log('❌ [CurrentLocation] Geolocation not available')
      showToast('위치 정보를 사용할 수 없습니다', 'error')
      return
    }

    console.log('🔍 [CurrentLocation] Getting position...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        console.log('✅ [CurrentLocation] Got position:', latitude, longitude)
        const latlng = new window.kakao.maps.LatLng(latitude, longitude)
        mapInstance.panTo(latlng)
        mapInstance.setLevel(5)
        showToast('현재 위치로 이동했습니다', 'success')
      },
      (error) => {
        console.error('❌ [CurrentLocation] Geolocation error:', error)
        showToast('위치 정보를 가져올 수 없습니다', 'error')
      }
    )
  }, [mapInstance, showToast])

  return (
    <KakaoMapProvider>
      <main className="relative h-dvh w-full overflow-hidden bg-zinc-950">
        <KakaoMap center={{ lat: 37.5665, lng: 126.978 }} level={5} className="h-full w-full" onMapReady={handleMapReady} onBoundsChanged={handleBoundsChanged} />

        <MapInstructionHint />

        {isLoadingNearby && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/95 px-6 py-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-orange-500" />
                <span className="text-sm font-medium text-zinc-100">근처 식당 검색 중...</span>
              </div>
            </div>
          </div>
        )}

        <header className="absolute inset-x-0 top-0 z-10 p-4 sm:p-6">
          <div className="mx-auto max-w-md">
            {!isSearchOpen ? (
              <div className="flex items-center gap-3 rounded-2xl border border-zinc-800/50 bg-zinc-900/90 px-4 py-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
                  <span className="text-lg">🌶️</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="truncate font-semibold tracking-tight text-zinc-50">맵찌주의보</h1>
                  <p className="truncate text-xs text-zinc-400">내 주변 매운 맛집 찾기</p>
                </div>
                {user && (
                  <button
                    type="button"
                    onClick={(e) => {
                      console.log('📄 [MyReviews] Button clicked, navigating to /my-reviews')
                      e.stopPropagation()
                      router.push('/my-reviews')
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                    aria-label="내 리뷰"
                    title="내 리뷰 보기"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(true)
                    setTimeout(() => searchInputRef.current?.focus(), 100)
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                  aria-label="검색"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/90 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center">
                    {isSearching ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
                    ) : (
                      <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                        />
                      </svg>
                    )}
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="맛집 검색 (예: 강남역 맛집)"
                    className="min-w-0 flex-1 bg-transparent text-sm text-zinc-50 placeholder-zinc-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                    aria-label="닫기"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {searchError && (
                  <div className="border-t border-zinc-800 px-4 py-3">
                    <p className="text-sm text-red-400">{searchError}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>



        {searchResults.length > 0 && (
          <div className="absolute right-4 top-24 z-10 w-80 max-h-[calc(100dvh-160px)] overflow-y-auto rounded-2xl border border-zinc-800/50 bg-zinc-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl sm:right-6 sm:top-28">
            <div className="sticky top-0 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/95 px-4 py-3 backdrop-blur-xl">
              <span className="text-xs font-semibold text-zinc-400">검색 결과 ({searchResults.length})</span>
              <button
                onClick={clearSearch}
                className="rounded-lg bg-zinc-800 px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
              >
                초기화
              </button>
            </div>

            <div className="divide-y divide-zinc-800/50">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left transition-colors hover:bg-zinc-800/50"
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${result.review_count && result.review_count > 0 ? 'bg-orange-500/20' : 'bg-blue-500/20'}`}>
                      <span className="text-sm">{result.review_count && result.review_count > 0 ? '🌶️' : '🍽️'}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-semibold text-zinc-100">{result.place_name}</h4>
                      <p className="mt-0.5 truncate text-xs text-zinc-500">{result.road_address_name || result.address_name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        {result.category_name && (
                          <p className="text-xs text-blue-400">{result.category_name.split(' > ').slice(-1)[0]}</p>
                        )}
                        {result.review_count !== undefined && result.review_count > 0 && (
                          <span className="text-xs text-orange-400">리뷰 {result.review_count}개</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="absolute bottom-6 right-4 z-10 flex flex-col gap-2 sm:bottom-8 sm:right-6">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleCurrentLocationClick()
            }}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800/50 bg-zinc-900/90 text-zinc-300 shadow-lg shadow-black/30 backdrop-blur-xl transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100 active:scale-95"
            aria-label="내 위치로 이동"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
          </button>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-32 bg-gradient-to-t from-zinc-950/80 to-transparent" />

        <BottomSheet isOpen={!!selectedPlace} onClose={() => { setSelectedPlace(null); setIsSpiceFormOpen(false); }}>
          {selectedPlace && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-zinc-100">
                {selectedPlace.place_name}
              </h2>

              {(
                <>
                  {selectedPlace.avg_spice_level !== undefined && selectedPlace.avg_spice_level !== null && (
                    <div className="flex items-center gap-3 rounded-xl bg-zinc-800/50 p-4">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <span
                            key={level}
                            className={`text-xl ${level <= Math.round(selectedPlace.avg_spice_level!) ? '' : 'opacity-30 grayscale'}`}
                          >
                            🌶️
                          </span>
                        ))}
                      </div>
                      <div>
                        <span className={`font-medium ${getSpiceLevelColor(selectedPlace.avg_spice_level)}`}>
                          {getSpiceLevelLabel(Math.round(selectedPlace.avg_spice_level))}
                        </span>
                        <span className="ml-2 text-sm text-zinc-500">
                          평균 {selectedPlace.avg_spice_level.toFixed(1)}/5 ({selectedPlace.review_count}개 리뷰)
                        </span>
                      </div>
                    </div>
                  )}

                  {'address_name' in selectedPlace && (
                    <div className="flex items-start gap-3 text-zinc-400">
                      <svg className="h-5 w-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      <span className="text-sm">{selectedPlace.road_address_name || selectedPlace.address_name}</span>
                    </div>
                  )}

                  {'phone' in selectedPlace && selectedPlace.phone && (
                    <div className="flex items-center gap-3 text-zinc-400">
                      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                      </svg>
                      <a href={`tel:${selectedPlace.phone}`} className="text-sm text-blue-400 hover:underline">
                        {selectedPlace.phone}
                      </a>
                    </div>
                  )}

                  {'category_name' in selectedPlace && selectedPlace.category_name && (
                    <p className="text-sm text-blue-400">{selectedPlace.category_name}</p>
                  )}

                  <AnimatePresence mode="wait">
                    {isSpiceFormOpen ? (
                      <SpiceLevelForm
                        key="form"
                        onSubmit={handleSpiceLevelSubmit}
                        onCancel={() => setIsSpiceFormOpen(false)}
                      />
                    ) : (
                      <button
                        key="button"
                        type="button"
                        onClick={handleAddSpiceLevelClick}
                        className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-orange-500/40"
                      >
                        🌶️ 맵기 레벨 등록하기
                      </button>
                    )}
                  </AnimatePresence>

                  {selectedPlace.reviews && selectedPlace.reviews.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-zinc-800">
                      <h3 className="text-lg font-semibold text-zinc-100">리뷰 ({selectedPlace.reviews.length})</h3>
                      <div className="space-y-3">
                        {selectedPlace.reviews.map((review) => (
                          <ReviewCard key={review.id} review={review} />
                        ))}
                      </div>
                    </div>
                  )}

                  {(!selectedPlace.reviews || selectedPlace.reviews.length === 0) && (
                    <div className="pt-4 border-t border-zinc-800">
                      <p className="text-center text-sm text-zinc-500">아직 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요!</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </BottomSheet>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

        {disambiguationCandidates.length > 0 && (
          <DisambiguationMenu
            candidates={disambiguationCandidates}
            onSelect={handleDisambiguationSelect}
            onClose={() => {
              setDisambiguationCandidates([])
              setDisambiguationPosition(null)
            }}
          />
        )}
      </main>
    </KakaoMapProvider>
  )
}
