'use client'

import type { ReactNode } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AdminLayout } from '@/components/admin/admin-layout'

interface AdminRootLayoutProps {
  children: ReactNode
}

export default function AdminRootLayout({ children }: AdminRootLayoutProps) {
  return (
    <ProtectedRoute redirectTo="/auth/login">
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  )
}


