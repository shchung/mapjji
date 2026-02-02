'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { KakaoMapProvider } from '@/components/map/KakaoMapScript'
import { KakaoMap } from '@/components/map/KakaoMap'
import { BottomSheet } from '@/components/ui/BottomSheet'
import type { KakaoPlace } from '@/app/api/search/route'

interface SearchResult extends KakaoPlace {
  lat: number
  lng: number
}

interface SampleRestaurant {
  id: string
  name: string
  lat: number
  lng: number
  spiceLevel: number
  description: string
}

type SelectedPlace = SampleRestaurant | SearchResult | null

const sampleRestaurants: SampleRestaurant[] = [
  { id: '1', name: '신전떡볶이 강남점', lat: 37.4979, lng: 127.0276, spiceLevel: 4, description: '매콤한 떡볶이 전문점' },
  { id: '2', name: '본죽 명동점', lat: 37.5635, lng: 126.985, spiceLevel: 1, description: '순한 죽 전문점' },
  { id: '3', name: '청년다방 홍대점', lat: 37.5563, lng: 126.9236, spiceLevel: 3, description: '중간 매운맛 분식' },
  { id: '4', name: '교촌치킨 이태원점', lat: 37.5345, lng: 126.9945, spiceLevel: 2, description: '순한 치킨' },
  { id: '5', name: '불닭발 신촌점', lat: 37.5559, lng: 126.9364, spiceLevel: 5, description: '매우 매운 닭발' },
]

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [mapInstance, setMapInstance] = useState<KakaoMapInstance | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace>(null)

  const searchMarkersRef = useRef<KakaoCustomOverlay[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  const debouncedQuery = useDebounce(searchQuery, 300)

  const clearSearchMarkers = useCallback(() => {
    searchMarkersRef.current.forEach((overlay) => overlay.setMap(null))
    searchMarkersRef.current = []
  }, [])

  const createSearchMarkers = useCallback(
    (results: SearchResult[], map: KakaoMapInstance) => {
      if (!window.kakao?.maps) return

      results.forEach((place) => {
        const markerContent = document.createElement('div')
        markerContent.innerHTML = `
          <div style="
            width: 36px;
            height: 36px;
            background: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            cursor: pointer;
          ">
            🍽️
          </div>
        `

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(place.lat, place.lng),
          content: markerContent,
          yAnchor: 1,
        })

        customOverlay.setMap(map)
        searchMarkersRef.current.push(customOverlay)

        markerContent.addEventListener('click', () => {
          setSelectedPlace(place)
        })
      })
    },
    []
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
          const errorData = await response.json()
          throw new Error(errorData.error || 'Search failed')
        }

        const data = await response.json()

        const results: SearchResult[] = data.places.map((place: KakaoPlace) => ({
          ...place,
          lat: parseFloat(place.y),
          lng: parseFloat(place.x),
        }))

        setSearchResults(results)
        clearSearchMarkers()

        if (mapInstance && results.length > 0) {
          createSearchMarkers(results, mapInstance)

          const firstResult = results[0]
          const position = new window.kakao.maps.LatLng(firstResult.lat, firstResult.lng)
          mapInstance.panTo(position)
          mapInstance.setLevel(5)
        }
      } catch (error) {
        console.error('[Search] Error:', error)
        setSearchError(error instanceof Error ? error.message : 'Search failed')
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    },
    [mapInstance, clearSearchMarkers, createSearchMarkers]
  )

  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery)
    } else {
      setSearchResults([])
      clearSearchMarkers()
    }
  }, [debouncedQuery, performSearch, clearSearchMarkers])

  const handleMapReady = useCallback((map: KakaoMapInstance) => {
    console.log('[Home] Map ready, adding markers...')
    setMapInstance(map)

    sampleRestaurants.forEach((restaurant) => {
      const color = restaurant.spiceLevel <= 2 ? '#10b981' : restaurant.spiceLevel === 3 ? '#f59e0b' : '#ef4444'

      const markerContent = document.createElement('div')
      markerContent.innerHTML = `
        <div style="
          width: 40px;
          height: 40px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          cursor: pointer;
        ">
          🌶️
        </div>
      `

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(restaurant.lat, restaurant.lng),
        content: markerContent,
        yAnchor: 1,
      })

      customOverlay.setMap(map)

      markerContent.addEventListener('click', () => {
        setSelectedPlace(restaurant)
      })
    })

    console.log(`[Home] Added ${sampleRestaurants.length} markers`)
  }, [])

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      if (!mapInstance || !window.kakao?.maps) return

      const position = new window.kakao.maps.LatLng(result.lat, result.lng)
      mapInstance.panTo(position)
      mapInstance.setLevel(3)
    },
    [mapInstance]
  )

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults([])
    setSearchError(null)
    clearSearchMarkers()
    setIsSearchOpen(false)
  }, [clearSearchMarkers])

  return (
    <KakaoMapProvider>
      <main className="relative h-dvh w-full overflow-hidden bg-zinc-950">
        <KakaoMap center={{ lat: 37.5665, lng: 126.978 }} level={5} className="h-full w-full" onMapReady={handleMapReady} />

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
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/20">
                      <span className="text-sm">🍽️</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-semibold text-zinc-100">{result.place_name}</h4>
                      <p className="mt-0.5 truncate text-xs text-zinc-500">{result.road_address_name || result.address_name}</p>
                      {result.category_name && (
                        <p className="mt-1 text-xs text-blue-400">{result.category_name.split(' > ').slice(-1)[0]}</p>
                      )}
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

        <BottomSheet isOpen={!!selectedPlace} onClose={() => setSelectedPlace(null)}>
          {selectedPlace && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-zinc-100">
                {'name' in selectedPlace ? selectedPlace.name : selectedPlace.place_name}
              </h2>
              {'spiceLevel' in selectedPlace && (
                <div className="flex items-center gap-3 rounded-xl bg-zinc-800/50 p-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <span
                        key={level}
                        className={`text-xl ${level <= selectedPlace.spiceLevel ? '' : 'opacity-30 grayscale'}`}
                      >
                        🌶️
                      </span>
                    ))}
                  </div>
                  <span className="text-zinc-100 font-medium">
                    매운맛 {selectedPlace.spiceLevel}/5
                  </span>
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
              {'description' in selectedPlace && (
                <p className="text-zinc-300">{selectedPlace.description}</p>
              )}
              {'category_name' in selectedPlace && selectedPlace.category_name && (
                <p className="text-sm text-blue-400">{selectedPlace.category_name}</p>
              )}
            </div>
          )}
        </BottomSheet>
      </main>
    </KakaoMapProvider>
  )
}
