'use client'

import type React from 'react'
import { GuestRoute } from '@/components/auth/guest-route'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <GuestRoute redirectTo="/admin/dashboard">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">{children}</div>
    </GuestRoute>
  )
}
