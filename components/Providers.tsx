'use client'

import { ReactNode } from 'react'
import { AuthProvider } from './auth/AuthProvider'
import { ToastProvider } from './ui/Toast'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  )
}
