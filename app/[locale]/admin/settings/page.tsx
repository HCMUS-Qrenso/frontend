'use client'

import { Suspense } from 'react'
import { SettingsPage } from '@/src/features/admin/settings'
import { FormPageSkeleton } from '@/src/components/loading'

export default function SettingsPageRoute() {
  return (
    <Suspense fallback={<FormPageSkeleton />}>
      <SettingsPage />
    </Suspense>
  )
}
