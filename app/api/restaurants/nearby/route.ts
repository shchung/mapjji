import { NextRequest, NextResponse } from 'next/server'

interface KakaoPlace {
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
  const x = searchParams.get('x')
  const y = searchParams.get('y')
  const radius = searchParams.get('radius') || '1000'

  if (!x || !y) {
    return NextResponse.json({ error: 'x and y parameters are required' }, { status: 400 })
  }

  const apiKey = process.env.KAKAO_REST_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Kakao REST API key is not configured' },
      { status: 500 }
    )
  }

  try {
    const allPlaces: KakaoPlace[] = []
    let page = 1
    const maxPages = 10
    let isEnd = false

    console.log('[Nearby API] Starting sequential fetch...')

    while (page <= maxPages && !isEnd) {
      const url = new URL('https://dapi.kakao.com/v2/local/search/category.json')
      url.searchParams.set('category_group_code', 'FD6')
      url.searchParams.set('x', x)
      url.searchParams.set('y', y)
      url.searchParams.set('radius', radius)
      url.searchParams.set('size', '15')
      url.searchParams.set('page', page.toString())
      url.searchParams.set('sort', 'distance')

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `KakaoAK ${apiKey}`,
        },
      })

      if (!response.ok) {
        if (response.status === 429) {
          console.warn(`[Nearby API] Rate limit hit on page ${page}, stopping`)
          break
        }
        const errorText = await response.text()
        console.error(`[Nearby API] Kakao API error (page ${page}): ${response.status}`, errorText)
        break
      }

      const data: KakaoSearchResponse = await response.json()
      
      console.log(`[Nearby API] Page ${page}: ${data.documents.length} results, is_end=${data.meta.is_end}, total_count=${data.meta.total_count}, pageable_count=${data.meta.pageable_count}`)
      
      allPlaces.push(...data.documents)
      isEnd = data.meta.is_end

      if (isEnd) {
        console.log(`[Nearby API] Kakao API says is_end=true at page ${page}. Total fetched: ${allPlaces.length}`)
        break
      }

      page++

      if (page <= maxPages && !isEnd) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log(`[Nearby API] Total: ${allPlaces.length} restaurants (${page} pages)`)

    return NextResponse.json({
      places: allPlaces,
      meta: {
        total_count: allPlaces.length,
        pageable_count: allPlaces.length,
        is_end: true,
      },
    })
  } catch (error) {
    console.error('[Nearby API] Error:', error)
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
