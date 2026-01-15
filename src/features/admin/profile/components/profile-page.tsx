'use client'

import { Suspense } from 'react'
import { ProfileForm } from './profile-form'

export function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileForm />
    </Suspense>
  )
}
