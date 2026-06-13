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
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="space-y-3">
        <label className="block font-unbounded text-sm font-bold text-red-100">
          매운맛 레벨
        </label>

        <div className="relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/30 to-zinc-900/50 p-6 shadow-lg shadow-red-900/20">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-50" />
          <div className="relative flex gap-3">
            {[1, 2, 3, 4, 5].map((level) => (
              <motion.button
                key={level}
                type="button"
                onClick={() => setSpiceLevel(level)}
                onMouseEnter={() => setHoveredLevel(level)}
                onMouseLeave={() => setHoveredLevel(0)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="group relative p-1.5"
              >
                <span
                  className={`text-4xl transition-all duration-200 ${
                    level <= displayLevel
                      ? 'scale-110 drop-shadow-[0_0_12px_rgba(255,46,46,0.6)]'
                      : 'grayscale opacity-30'
                  }`}
                >
                  🌶️
                </span>
                {level <= displayLevel && (
                  <motion.div
                    layoutId="chili-glow"
                    className="absolute inset-0 -z-10 animate-pulse rounded-full bg-red-500/30 blur-lg"
                    style={{ animationDuration: '2s' }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          <div className="relative h-7 text-center">
            {displayLevel > 0 && (
              <motion.span
                key={displayLevel}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`font-dm-mono text-xs font-bold tracking-wider ${
                  displayLevel <= 2
                    ? 'text-emerald-400'
                    : displayLevel === 3
                    ? 'text-amber-400'
                    : 'text-red-400'
                } drop-shadow-[0_0_8px_rgba(255,46,46,0.3)]`}
              >
                {spiceLevelLabels[displayLevel].toUpperCase()}
              </motion.span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="comment" className="block font-unbounded text-sm font-bold text-red-100">
          한줄평 <span className="font-dm-mono text-xs font-medium text-zinc-600">(OPTIONAL)</span>
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="이 집 매운 정도는..."
          rows={2}
          maxLength={200}
          className="w-full resize-none rounded-xl border border-red-500/20 bg-zinc-900/50 px-4 py-3 font-dm-mono text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-red-500/50 focus:bg-zinc-900/80 focus:ring-2 focus:ring-red-500/20"
          disabled={isSubmitting}
        />
        <p className="text-right font-dm-mono text-[10px] tracking-wider text-zinc-600">{comment.length}/200</p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 rounded-xl border border-red-500/20 bg-zinc-900/50 px-4 py-3.5 font-dm-mono text-xs font-medium tracking-wider text-zinc-400 transition-all hover:border-red-500/40 hover:bg-zinc-900/80 hover:text-zinc-300 disabled:opacity-50"
        >
          CANCEL
        </button>
        <button
          type="submit"
          disabled={isSubmitting || spiceLevel === 0}
          className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-red-500/50 bg-gradient-to-r from-red-600 to-red-700 px-4 py-3.5 font-unbounded text-xs font-bold tracking-tight text-white shadow-2xl shadow-red-600/40 transition-all hover:border-red-500 hover:shadow-red-600/60 disabled:opacity-50 disabled:shadow-none"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 via-red-300/20 to-red-400/0 opacity-0 transition-opacity group-hover:opacity-100" />
          {isSubmitting ? (
            <div className="relative h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <span className="relative drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">등록하기</span>
          )}
        </button>
      </div>
    </motion.form>
  )
}
