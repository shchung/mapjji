import { NextRequest, NextResponse } from 'next/server'

export interface KakaoPlace {
  id: string
  place_name: string
  address_name: string
  road_address_name: string
  x: string
  y: string
  phone: string
  category_name: string
  place_url: string
  distance?: string
}

interface KakaoSearchResponse {
  documents: KakaoPlace[]
  meta: {
    total_count: number
    pageable_count: number
    is_end: boolean
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')
  const x = searchParams.get('x')
  const y = searchParams.get('y')
  const radius = searchParams.get('radius')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  const apiKey = process.env.KAKAO_REST_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Kakao REST API key is not configured. Add KAKAO_REST_API_KEY to .env.local' },
      { status: 500 }
    )
  }

  try {
    const url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json')
    url.searchParams.set('query', query)
    url.searchParams.set('category_group_code', 'FD6')
    url.searchParams.set('size', '15')
    
    if (x && y) {
      url.searchParams.set('x', x)
      url.searchParams.set('y', y)
      if (radius) {
        url.searchParams.set('radius', radius)
      }
      url.searchParams.set('sort', 'distance')
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Search API] Kakao API error: ${response.status}`, errorText)
      return NextResponse.json({ error: `Kakao API error: ${response.status}` }, { status: response.status })
    }

    const data: KakaoSearchResponse = await response.json()

    return NextResponse.json({
      places: data.documents,
      meta: data.meta,
    })
  } catch (error) {
    console.error('[Search API] Error:', error)
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
