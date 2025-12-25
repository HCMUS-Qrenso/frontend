'use client'

import type { ReactNode } from 'react'
import { ProtectedRoute } from '@/src/features/auth/components/protected-route'
import { AdminLayout } from '@/src/features/admin/shared/components/admin-layout'

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
