'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/auth/AuthProvider'
import { ReviewCard } from '@/components/ui/ReviewCard'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'

interface Review {
  id: string
  spice_level: number
  comment: string | null
  created_at: string
  user_id: string
  restaurant_id: string
}

interface ReviewWithRestaurant extends Review {
  restaurant_name: string
  restaurant_address?: string
}

export default function MyReviewsPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const { showToast } = useToast()
  const supabase = createClient()

  const [reviews, setReviews] = useState<ReviewWithRestaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(0)

  const REVIEWS_PER_PAGE = 20

  useEffect(() => {
    if (isAuthLoading) return

    if (!user) {
      showToast('로그인이 필요합니다', 'error')
      router.push('/')
      return
    }

    fetchUserReviews(0)
  }, [user, isAuthLoading])

  const fetchUserReviews = async (pageNum: number) => {
    if (!user) return

    try {
      setIsLoading(true)

      const start = pageNum * REVIEWS_PER_PAGE
      const end = start + REVIEWS_PER_PAGE - 1

      const { data, error, count } = await supabase
        .from('reviews')
        .select(`
          id,
          spice_level,
          comment,
          created_at,
          user_id,
          restaurant_id,
          restaurants!inner (
            name,
            address
          )
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(start, end)

      if (error) throw error

      const reviewsWithRestaurant: ReviewWithRestaurant[] = (data || []).map((item: any) => ({
        id: item.id,
        spice_level: item.spice_level,
        comment: item.comment,
        created_at: item.created_at,
        user_id: item.user_id,
        restaurant_id: item.restaurant_id,
        restaurant_name: item.restaurants.name,
        restaurant_address: item.restaurants.address,
      }))

      if (pageNum === 0) {
        setReviews(reviewsWithRestaurant)
      } else {
        setReviews((prev) => [...prev, ...reviewsWithRestaurant])
      }

      setHasMore((count || 0) > end + 1)
      setPage(pageNum)
    } catch (err) {
      console.error('Error fetching reviews:', err)
      showToast('리뷰를 불러올 수 없습니다', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchUserReviews(page + 1)
    }
  }

  if (isAuthLoading || (isLoading && page === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-orange-500 mx-auto"></div>
          <p className="text-zinc-400">리뷰 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>돌아가기</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-3xl font-bold text-white">내 리뷰</h1>
          <p className="text-zinc-400">
            내가 작성한 리뷰 {reviews.length}개
          </p>
        </motion.div>

        {reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-16 text-center"
          >
            <div className="mb-4 text-6xl">🌶️</div>
            <h2 className="mb-2 text-xl font-semibold text-zinc-300">
              아직 작성한 리뷰가 없습니다
            </h2>
            <p className="mb-6 text-zinc-500">
              지도에서 식당을 선택하고 맵기 레벨을 등록해보세요!
            </p>
            <button
              onClick={() => router.push('/')}
              className="rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-6 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105"
            >
              지도로 이동
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-zinc-300">
                    {review.restaurant_name}
                  </span>
                  {review.restaurant_address && (
                    <span className="text-zinc-500">
                      · {review.restaurant_address}
                    </span>
                  )}
                </div>
                <ReviewCard review={review} />
              </motion.div>
            ))}

            {hasMore && (
              <div className="pt-4 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="rounded-full bg-zinc-800 px-6 py-3 font-semibold text-zinc-300 transition-all hover:bg-zinc-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-400"></div>
                      로딩 중...
                    </span>
                  ) : (
                    '더 보기'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
