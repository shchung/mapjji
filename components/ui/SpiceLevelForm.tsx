'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface SpiceLevelFormProps {
  onSubmit: (spiceLevel: number, comment: string) => Promise<void>
  onCancel: () => void
}

export function SpiceLevelForm({ onSubmit, onCancel }: SpiceLevelFormProps) {
  const [spiceLevel, setSpiceLevel] = useState(0)
  const [hoveredLevel, setHoveredLevel] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (spiceLevel === 0) return

    setIsSubmitting(true)
    await onSubmit(spiceLevel, comment)
    setIsSubmitting(false)
  }

  const displayLevel = hoveredLevel || spiceLevel

  const spiceLevelLabels = [
    '',
    '순한맛',
    '약간 매운맛',
    '보통 매운맛',
    '매운맛',
    '극강 매운맛'
  ]

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="space-y-3">
        <label className="block text-sm font-medium text-zinc-300">
          매운맛 레벨
        </label>
        
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-zinc-800/50 p-5">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <motion.button
                key={level}
                type="button"
                onClick={() => setSpiceLevel(level)}
                onMouseEnter={() => setHoveredLevel(level)}
                onMouseLeave={() => setHoveredLevel(0)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                className="group relative p-1"
              >
                <span
                  className={`text-3xl transition-all duration-200 ${
                    level <= displayLevel
                      ? 'scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]'
                      : 'grayscale opacity-40'
                  }`}
                >
                  🌶️
                </span>
                {level <= displayLevel && (
                  <motion.div
                    layoutId="chili-glow"
                    className="absolute inset-0 -z-10 rounded-full bg-orange-500/20 blur-md"
                  />
                )}
              </motion.button>
            ))}
          </div>
          
          <div className="h-6 text-center">
            {displayLevel > 0 && (
              <motion.span
                key={displayLevel}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-sm font-medium ${
                  displayLevel <= 2
                    ? 'text-emerald-400'
                    : displayLevel === 3
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {spiceLevelLabels[displayLevel]}
              </motion.span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="comment" className="block text-sm font-medium text-zinc-300">
          한줄평 <span className="text-zinc-500">(선택)</span>
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="이 집 매운 정도는..."
          rows={2}
          maxLength={200}
          className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-800/50 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
          disabled={isSubmitting}
        />
        <p className="text-right text-xs text-zinc-500">{comment.length}/200</p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 font-medium text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-800 disabled:opacity-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting || spiceLevel === 0}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-orange-500/40 disabled:opacity-50 disabled:shadow-none"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            '등록하기'
          )}
        </button>
      </div>
    </motion.form>
  )
}
