'use client'

import { useEffect, useRef } from 'react'
import { useKakaoMap } from './KakaoMapScript'

interface KakaoMapProps {
  center?: { lat: number; lng: number }
  level?: number
  className?: string
  onMapReady?: (map: KakaoMapInstance) => void
}

export function KakaoMap({
  center = { lat: 37.5665, lng: 126.978 },
  level = 3,
  className = '',
  onMapReady,
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<KakaoMapInstance | null>(null)
  const isInitializedRef = useRef(false)
  const { state, error } = useKakaoMap()

  useEffect(() => {
    console.log('[KakaoMap] useEffect triggered, state:', state)
    console.log('[KakaoMap] mapRef.current:', !!mapRef.current)
    console.log('[KakaoMap] isInitializedRef.current:', isInitializedRef.current)
    
    if (state !== 'ready' || !mapRef.current || isInitializedRef.current) return

    console.log('[KakaoMap] Initializing map...')
    console.log('[KakaoMap] Center:', center)
    console.log('[KakaoMap] Level:', level)

    try {
      const options: KakaoMapOptions = {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level: level,
      }

      const map = new window.kakao.maps.Map(mapRef.current, options)
      mapInstanceRef.current = map
      isInitializedRef.current = true

      console.log('[KakaoMap] Map initialized successfully!')
      onMapReady?.(map)
    } catch (err) {
      console.error('[KakaoMap] Map initialization error:', err)
    }
  }, [state, center.lat, center.lng, level, onMapReady])

  useEffect(() => {
    if (!mapInstanceRef.current || !isInitializedRef.current) return

    const newCenter = new window.kakao.maps.LatLng(center.lat, center.lng)
    mapInstanceRef.current.panTo(newCenter)
  }, [center.lat, center.lng])

  useEffect(() => {
    if (!mapInstanceRef.current || !isInitializedRef.current) return

    mapInstanceRef.current.setLevel(level, { animate: { duration: 300 } })
  }, [level])

  if (state === 'error') {
    return (
      <div className={`flex items-center justify-center bg-zinc-900 ${className}`}>
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
            <svg
              className="h-8 w-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-zinc-100">지도를 불러올 수 없습니다</h3>
            <p className="max-w-xs text-sm text-zinc-400">{error || '잠시 후 다시 시도해주세요'}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-full bg-zinc-800 px-6 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  if (state !== 'ready') {
    return (
      <div className={`flex items-center justify-center bg-zinc-900 ${className}`}>
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="h-14 w-14 animate-spin rounded-full border-[3px] border-zinc-700 border-t-orange-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl">🌶️</span>
            </div>
          </div>
          <div className="space-y-1 text-center">
            <p className="text-sm font-medium text-zinc-300">지도 불러오는 중...</p>
            <p className="text-xs text-zinc-500">맵찌 데이터 준비 중</p>
          </div>
        </div>
      </div>
    )
  }

  return <div ref={mapRef} className={className} />
}
