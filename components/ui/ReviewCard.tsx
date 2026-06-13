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
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-red-500/30 bg-gradient-to-br from-red-600 to-red-800 shadow-lg shadow-red-600/30">
          <span className="font-dm-mono text-xs font-bold text-white drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]">
            {getUserInitial()}
          </span>
        </div>
        <span className="font-dm-mono text-xs font-medium text-zinc-400">
          USER_{review.user_id.substring(0, 6)}
        </span>
      </div>
      <span className="font-dm-mono text-[10px] tracking-wider text-zinc-600">
        {formatDate(review.created_at).toUpperCase()}
      </span>
    </div>
  )

  const renderSpiceLevel = () => (
    <div className="mb-3 flex items-center gap-3">
      <span className="text-2xl drop-shadow-lg">{getSpiceEmoji(review.spice_level)}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`relative transition-all ${level <= review.spice_level ? '' : 'opacity-20 grayscale'}`}
          >
            {level <= review.spice_level && (
              <div className="absolute inset-0 animate-pulse rounded-full bg-red-500/20" style={{ animationDuration: '2s' }} />
            )}
            <span className="relative text-base drop-shadow-[0_0_4px_rgba(255,46,46,0.4)]">🌶️</span>
          </div>
        ))}
      </div>
      <span className="font-dm-mono text-xs font-medium tracking-wide text-red-400">
        {getSpiceLabel(review.spice_level).toUpperCase()}
      </span>
    </div>
  )

  const renderComment = () => {
    if (!review.comment) return null
    return (
      <p className="font-dm-mono text-xs leading-relaxed text-zinc-400">
        {review.comment}
      </p>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-xl border border-red-500/20 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 p-4 shadow-lg shadow-red-900/10 backdrop-blur-sm transition-all hover:border-red-500/30 hover:shadow-red-900/20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative">
        {renderUserInfo()}
        {renderSpiceLevel()}
        {renderComment()}
      </div>
    </motion.div>
  )
}
