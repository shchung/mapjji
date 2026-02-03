'use client'

import { motion } from 'framer-motion'

interface Review {
  id: string
  spice_level: number
  comment: string | null
  created_at: string
  user_id: string
}

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  const getSpiceEmoji = (level: number) => {
    if (level === 1) return '😊'
    if (level === 2) return '😋'
    if (level === 3) return '🔥'
    if (level === 4) return '🥵'
    return '💀'
  }

  const getSpiceLabel = (level: number) => {
    if (level === 1) return '순한맛'
    if (level === 2) return '보통'
    if (level === 3) return '매운맛'
    if (level === 4) return '아주 매운맛'
    return '극한의 맛'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '오늘'
    if (diffDays === 1) return '어제'
    if (diffDays < 7) return `${diffDays}일 전`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`
    return `${Math.floor(diffDays / 365)}년 전`
  }

  const getUserInitial = () => {
    return review.user_id.substring(0, 2).toUpperCase()
  }

  const renderUserInfo = () => (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-xs font-bold text-white">
          {getUserInitial()}
        </div>
        <span className="text-sm font-medium text-zinc-300">
          사용자 {review.user_id.substring(0, 8)}
        </span>
      </div>
      <span className="text-xs text-zinc-500">
        {formatDate(review.created_at)}
      </span>
    </div>
  )

  const renderSpiceLevel = () => (
    <div className="mb-2 flex items-center gap-2">
      <span className="text-2xl">{getSpiceEmoji(review.spice_level)}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <span
            key={level}
            className={`text-sm ${level <= review.spice_level ? '' : 'opacity-20 grayscale'}`}
          >
            🌶️
          </span>
        ))}
      </div>
      <span className="text-sm font-medium text-zinc-400">
        {getSpiceLabel(review.spice_level)}
      </span>
    </div>
  )

  const renderComment = () => {
    if (!review.comment) return null
    return (
      <p className="text-sm leading-relaxed text-zinc-300">
        {review.comment}
      </p>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
    >
      {renderUserInfo()}
      {renderSpiceLevel()}
      {renderComment()}
    </motion.div>
  )
}
