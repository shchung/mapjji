'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MapInstructionHintProps {
  onDismiss?: () => void
}

export function MapInstructionHint({ onDismiss }: MapInstructionHintProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasSeenHint = localStorage.getItem('hasSeenMapHint')
    if (!hasSeenHint) {
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('hasSeenMapHint', 'true')
    onDismiss?.()
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-center px-4"
        >
          <div className="pointer-events-auto max-w-sm rounded-2xl border border-blue-500/50 bg-blue-950/95 px-6 py-4 shadow-2xl shadow-blue-500/20 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20">
                <span className="text-xl">👆</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-blue-100">지도를 클릭해보세요</h3>
                <p className="mt-1 text-sm text-blue-200/80">
                  지도의 아무 곳이나 클릭하면 근처 식당을 찾아드려요
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-blue-200 transition-colors hover:bg-blue-500/20"
                aria-label="닫기"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
