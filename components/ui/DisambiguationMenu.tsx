'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { KakaoPlace } from '@/app/api/search/route'

interface SearchResult extends KakaoPlace {
  lat: number
  lng: number
}

interface DisambiguationMenuProps {
  candidates: SearchResult[]
  onSelect: (restaurant: SearchResult) => void
  onClose: () => void
}

export function DisambiguationMenu({ candidates, onSelect, onClose }: DisambiguationMenuProps) {
  if (candidates.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-sm sm:-translate-x-1/2"
      >
        <div className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900 shadow-2xl shadow-black/50">
          <div className="border-b border-zinc-800 px-4 py-3">
            <h3 className="text-sm font-semibold text-zinc-100">여러 레스토랑이 있습니다</h3>
            <p className="mt-0.5 text-xs text-zinc-500">선택하세요</p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {candidates.map((restaurant, index) => (
              <button
                key={`${restaurant.id}-${index}`}
                onClick={() => {
                  onSelect(restaurant)
                  onClose()
                }}
                className="w-full border-b border-zinc-800/50 px-4 py-3 text-left transition-colors hover:bg-zinc-800/50 last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/20">
                    <span className="text-lg">🍴</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-semibold text-zinc-100">
                      {restaurant.place_name}
                    </h4>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {restaurant.road_address_name || restaurant.address_name}
                    </p>
                    {restaurant.category_name && (
                      <p className="mt-1 text-xs text-orange-400">
                        {restaurant.category_name.split(' > ').slice(-1)[0]}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-zinc-800 p-3">
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              취소
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
