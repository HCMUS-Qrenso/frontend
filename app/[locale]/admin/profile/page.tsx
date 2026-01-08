'use client'

import { Suspense } from 'react'
import { ProfilePage } from '@/src/features/admin/profile'

export default function ProfilePageRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePage />
    </Suspense>
  )
}
