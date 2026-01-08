'use client'

import React, { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader } from '@/src/components/ui/card'
import { useProfileQuery, useUpdateProfileMutation } from '../queries'
import { Skeleton } from '@/src/components/ui/skeleton'
import { toast } from 'sonner'
import { ProfileOverviewCard } from './profile-overview-card'
import { ProfileEditForm } from './profile-edit-form'
import { ChangePasswordForm } from './change-password-form'
import type { UserProfile, UpdateProfilePayload } from '../types'

export function ProfileForm() {
  const t = useTranslations('profile')
  const { data: profileData, isLoading, isError } = useProfileQuery()
  const updateMutation = useUpdateProfileMutation()

  const [formData, setFormData] = useState<Partial<UserProfile>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize form data when profile is loaded
  React.useEffect(() => {
    if (profileData) {
      setFormData(profileData)
    }
  }, [profileData])

  const handleSave = useCallback(async () => {
    if (!formData.id) return

    const updateData: UpdateProfilePayload = {
      fullName: formData.fullName,
      phone: formData.phone || undefined,
    }

    try {
      await updateMutation.mutateAsync(updateData)
      setHasChanges(false)
      toast.success(t('updateSuccess'))
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error(t('updateError'))
    }
  }, [formData, updateMutation, t])

  if (isLoading) {
    return <ProfileFormSkeleton />
  }

  if (isError || !profileData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">{t('loadError')}</p>
      </div>
    )
  }

  const profile = profileData

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <ProfileOverviewCard profile={profile} />
        <ProfileEditForm
          profile={profile}
          formData={formData}
          setFormData={setFormData}
          setHasChanges={setHasChanges}
          hasChanges={hasChanges}
          onSave={handleSave}
          isSaving={updateMutation.isPending}
        />
      </div>

      {/* Change Password Section */}
      <ChangePasswordForm />
    </div>
  )
}

// Loading skeleton component
function ProfileFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Skeleton className="mx-auto mb-4 h-24 w-24 rounded-full" />
            <Skeleton className="mx-auto mb-2 h-6 w-32" />
            <Skeleton className="mx-auto h-4 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
