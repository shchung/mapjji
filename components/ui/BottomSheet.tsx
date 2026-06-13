'use client'

import { useEffect, ReactNode } from 'react'
import { motion, PanInfo, AnimatePresence } from 'framer-motion'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 35, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-[32px] border-t-2 border-red-500/30 bg-gradient-to-b from-zinc-950 to-zinc-900 shadow-2xl shadow-red-900/40"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="sticky top-0 z-10 flex justify-center bg-gradient-to-b from-zinc-950 to-transparent pt-4 pb-3">
              <div className="h-1 w-16 rounded-full bg-red-500/40 shadow-lg shadow-red-600/30" />
            </div>
            <div className="relative px-6 pb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-50 pointer-events-none" />
              <div className="relative">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
