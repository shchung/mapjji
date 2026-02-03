'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from './AuthProvider'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signInWithEmail, signInWithGoogle, signInWithKakao } = useAuth()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)
    setError(null)

    const { error } = await signInWithEmail(email)
    
    if (error) {
      setError(error.message)
    } else {
      setEmailSent(true)
    }
    setIsSubmitting(false)
  }

  const handleGoogleLogin = async () => {
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
  }

  const handleKakaoLogin = async () => {
    setError(null)
    const { error } = await signInWithKakao()
    if (error) setError(error.message)
  }

  const handleClose = () => {
    setEmail('')
    setEmailSent(false)
    setError(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2"
          >
            <div className="relative overflow-hidden rounded-3xl border border-zinc-800/60 bg-zinc-900 shadow-2xl shadow-black/50">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5" />
              
              <div className="relative p-6">
                <button
                  onClick={handleClose}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="mb-6 text-center">
                  <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/25">
                    <span className="text-2xl">🌶️</span>
                  </div>
                  <h2 className="text-xl font-bold text-zinc-100">로그인</h2>
                  <p className="mt-1 text-sm text-zinc-400">맵기 레벨을 등록하려면 로그인하세요</p>
                </div>

                {emailSent ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-emerald-500/10 p-6 text-center"
                  >
                    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                      <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-emerald-400">메일을 확인하세요!</h3>
                    <p className="mt-2 text-sm text-zinc-400">
                      <span className="font-medium text-zinc-300">{email}</span>로<br />
                      로그인 링크를 보냈습니다
                    </p>
                    <button
                      onClick={() => setEmailSent(false)}
                      className="mt-4 text-sm text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
                    >
                      다른 이메일로 다시 시도
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <form onSubmit={handleEmailSubmit} className="space-y-3">
                      <div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="이메일 주소"
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-800/50 px-4 py-3 text-zinc-100 placeholder-zinc-500 outline-none transition-all focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                          disabled={isSubmitting}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting || !email.trim()}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-orange-500/40 disabled:opacity-50 disabled:shadow-none"
                      >
                        {isSubmitting ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                            </svg>
                            이메일로 로그인
                          </>
                        )}
                      </button>
                    </form>

                    <div className="my-6 flex items-center gap-4">
                      <div className="h-px flex-1 bg-zinc-800" />
                      <span className="text-xs text-zinc-500">또는</span>
                      <div className="h-px flex-1 bg-zinc-800" />
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleGoogleLogin}
                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 font-medium text-zinc-200 transition-all hover:border-zinc-600 hover:bg-zinc-800"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Google로 계속하기
                      </button>

                      <button
                        onClick={handleKakaoLogin}
                        className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#FEE500] px-4 py-3 font-medium text-[#391B1B] transition-all hover:bg-[#F5DC00]"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#391B1B">
                          <path d="M12 3c-5.523 0-10 3.582-10 8 0 2.816 1.864 5.284 4.668 6.703-.203.733-.742 2.675-.85 3.09-.135.514.188.507.395.369.163-.108 2.593-1.756 3.642-2.468.693.1 1.405.152 2.145.152 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
                        </svg>
                        카카오로 계속하기
                      </button>
                    </div>
                  </>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-xl bg-red-500/10 p-3 text-center text-sm text-red-400"
                  >
                    {error}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
