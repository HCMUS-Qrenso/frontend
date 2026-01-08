'use client'

import { Suspense } from 'react'
import { SettingsPage } from '@/src/features/admin/settings'

export default function SettingsPageRoute() {
  return (
    <Suspense fallback={null}>
      <SettingsPage />
    </Suspense>
  )
}
