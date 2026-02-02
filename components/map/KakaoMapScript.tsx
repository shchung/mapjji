'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import Script from 'next/script'

type KakaoMapState = 'idle' | 'loading' | 'ready' | 'error'

interface KakaoMapContextType {
  state: KakaoMapState
  error: string | null
}

const KakaoMapContext = createContext<KakaoMapContextType>({
  state: 'idle',
  error: null,
})

export function useKakaoMap() {
  return useContext(KakaoMapContext)
}

interface KakaoMapProviderProps {
  children: ReactNode
}

export function KakaoMapProvider({ children }: KakaoMapProviderProps) {
  const [state, setState] = useState<KakaoMapState>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleLoad = useCallback(() => {
    console.log('[KakaoMap] Script loaded, checking window.kakao...')
    console.log('[KakaoMap] window.kakao exists:', !!window.kakao)
    console.log('[KakaoMap] window.kakao.maps exists:', !!window.kakao?.maps)
    console.log('[KakaoMap] window.kakao.maps.load exists:', !!window.kakao?.maps?.load)
    
    setState('loading')
    if (!window.kakao?.maps?.load) {
      const errorMsg = 'Kakao Maps SDK failed to initialize'
      console.error('[KakaoMap]', errorMsg)
      console.error('[KakaoMap] window.kakao:', window.kakao)
      setError(errorMsg)
      setState('error')
      return
    }
    
    console.log('[KakaoMap] Calling kakao.maps.load()...')
    window.kakao.maps.load(() => {
      console.log('[KakaoMap] Maps loaded successfully!')
      setState('ready')
    })
  }, [])

  const handleError = useCallback((e: any) => {
    console.error('[KakaoMap] Script loading error:', e)
    setError('Failed to load Kakao Maps SDK')
    setState('error')
  }, [])

  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY

  console.log('[KakaoMap] API Key configured:', !!apiKey)
  console.log('[KakaoMap] API Key (first 10 chars):', apiKey?.substring(0, 10))

  if (!apiKey) {
    console.error('[KakaoMap] API key is missing!')
    return (
      <KakaoMapContext.Provider value={{ state: 'error', error: 'Kakao Maps API key is not configured' }}>
        {children}
      </KakaoMapContext.Provider>
    )
  }

  return (
    <KakaoMapContext.Provider value={{ state, error }}>
      <Script
         src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services`}
        strategy="afterInteractive"
        onLoad={handleLoad}
        onError={handleError}
      />
      {children}
    </KakaoMapContext.Provider>
  )
}
