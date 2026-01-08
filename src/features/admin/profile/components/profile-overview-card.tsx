'use client'

import React, { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/src/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { Badge } from '@/src/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import { Shield, Calendar, Edit, Trash2 } from 'lucide-react'
import { useUploadFiles } from '@/src/hooks/use-uploads'
import { useUpdateProfileMutation } from '../queries'
import { toast } from 'sonner'
import { cn } from '@/src/lib/utils'
import { AvatarCropDialog } from './avatar-crop-dialog'
import { UserProfile } from '../types/profile.types'

interface ProfileOverviewCardProps {
  profile: UserProfile
}

export function ProfileOverviewCard({ profile }: ProfileOverviewCardProps) {
  const t = useTranslations('profile')
  const { uploadFiles, isUploading: isAvatarUploading } = useUploadFiles()
  const updateMutation = useUpdateProfileMutation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null)

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('avatarInvalidType'))
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error(t('avatarTooLarge'))
      return
    }

    // Create object URL for cropping
    const imageSrc = URL.createObjectURL(file)
    setSelectedImageFile(file)
    setSelectedImageSrc(imageSrc)
    setCropDialogOpen(true)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveAvatar = async () => {
    setShowOptions(false)
    try {
      // Immediately update the profile to remove the avatar
      await updateMutation.mutateAsync({
        avatarUrl: null,
      })

      toast.success(t('avatarRemoveSuccess'))
    } catch (error) {
      console.error('Avatar removal failed:', error)
      toast.error(t('avatarRemoveError'))
    }
  }

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (!selectedImageFile) return

    try {
      // Create a new file from the cropped blob
      const croppedFile = new File([croppedImageBlob], selectedImageFile.name, {
        type: 'image/jpeg',
      })

      const results = await uploadFiles([croppedFile], { group: 'avatars' })
      if (results.length > 0) {
        const { url } = results[0]

        // Immediately update the profile with the new avatar URL
        await updateMutation.mutateAsync({
          avatarUrl: url,
        })

        toast.success(t('avatarUploadSuccess'))
      }
    } catch (error) {
      console.error('Avatar upload failed:', error)
      toast.error(t('avatarUploadError'))
    } finally {
      // Clean up
      if (selectedImageSrc) {
        URL.revokeObjectURL(selectedImageSrc)
      }
      setSelectedImageFile(null)
      setSelectedImageSrc(null)
    }
  }

  const handleChangeAvatar = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <div
        className={cn(
          'rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm lg:col-span-1 dark:border-slate-800 dark:bg-slate-900/80',
        )}
      >
        <div className="text-center">
          <div className="relative mb-4 flex justify-center">
            <Popover open={showOptions} onOpenChange={setShowOptions}>
              <PopoverTrigger asChild>
                <div className="relative cursor-pointer">
                  <Avatar className="h-48 w-48">
                    <AvatarImage src={profile.avatarUrl || undefined} alt={profile.fullName} />
                    <AvatarFallback className="text-8xl">
                      {profile.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {/* Avatar Upload Overlay */}
                  <div
                    className="absolute top-0 left-1/2 flex h-48 w-48 -translate-x-1/2 transform items-center justify-center rounded-full bg-black/50 transition-opacity"
                    style={{ opacity: isAvatarUploading ? 1 : 0 }}
                  >
                    {isAvatarUploading && (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    )}
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" side="bottom" align="center">
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={handleChangeAvatar}
                    disabled={isAvatarUploading}
                  >
                    <Edit className="h-4 w-4" />
                    {t('changeAvatar')}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-2"
                    onClick={handleRemoveAvatar}
                    disabled={isAvatarUploading || updateMutation.isPending || !profile.avatarUrl}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('removeAvatar')}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <h3 className="text-xl font-semibold">{profile.fullName}</h3>
          <p className="text-muted-foreground">{profile.email}</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Shield className="text-muted-foreground h-4 w-4" />
            <span className="text-sm capitalize">{profile.role}</span>
          </div>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
        <div className="mt-4 flex justify-center">
          <Badge variant="secondary" className="gap-2">
            <Calendar className="h-3 w-3" />
            {t('memberSince')} {new Date(profile.createdAt).toLocaleDateString()}
          </Badge>
        </div>
      </div>

      {/* Avatar Crop Dialog */}
      <AvatarCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imageSrc={selectedImageSrc}
        onCropComplete={handleCropComplete}
        isUploading={isAvatarUploading}
      />
    </>
  )
}
