'use client'

import { useRef, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Button } from '@/src/components/ui/button'
import { SettingsSection } from './settings-section'
import { Store, Upload, X, Loader2 } from 'lucide-react'
import { useUploadFiles } from '@/src/hooks/use-uploads'
import { toast } from 'sonner'

interface RestaurantInfoSettings {
  name: string
  address: string | null
  image: string | null
}

interface RestaurantInfoFormProps {
  settings: RestaurantInfoSettings
  onChange: (settings: Partial<RestaurantInfoSettings>) => void
}

export function RestaurantInfoForm({ settings, onChange }: RestaurantInfoFormProps) {
  const t = useTranslations('settings.restaurantInfo')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadFiles, isUploading, progress: uploadProgress } = useUploadFiles()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(t('invalidFileType'))
        return
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error(t('fileTooLarge'))
        return
      }

      try {
        // Create preview URL
        const objectUrl = URL.createObjectURL(file)
        setPreviewUrl(objectUrl)

        // Upload to S3
        const results = await uploadFiles([file], { group: 'restaurant-images' })
        if (results.length > 0) {
          onChange({ image: results[0].url })
          toast.success(t('uploadSuccess'))
        }

        // Clean up preview URL
        URL.revokeObjectURL(objectUrl)
        setPreviewUrl(null)
      } catch (error) {
        toast.error(t('uploadError'))
        setPreviewUrl(null)
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [uploadFiles, onChange, t],
  )

  const handleRemoveImage = useCallback(() => {
    onChange({ image: null })
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }, [onChange, previewUrl])

  // Current image to display (preview takes priority)
  const displayImage = previewUrl || settings.image

  return (
    <SettingsSection
      id="restaurant-info"
      title={t('title')}
      description={t('description')}
      icon={Store}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Name & Address */}
        <div className="space-y-4">
          {/* Restaurant Name */}
          <div className="space-y-2">
            <Label htmlFor="restaurantName">{t('name')}</Label>
            <Input
              id="restaurantName"
              type="text"
              value={settings.name || ''}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder={t('namePlaceholder')}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="restaurantAddress">{t('address')}</Label>
            <Input
              id="restaurantAddress"
              type="text"
              value={settings.address || ''}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder={t('addressPlaceholder')}
            />
          </div>
        </div>

        {/* Right Column - Image Upload */}
        <div className="space-y-2">
          <Label>{t('image')}</Label>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {displayImage ? (
            <div className="relative">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={displayImage}
                  alt={settings.name || 'Restaurant'}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="flex flex-col items-center gap-2 text-white">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="text-sm">{uploadProgress}%</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleImageUpload}
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {t('changeImage')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="mr-2 h-4 w-4" />
                  {t('removeImage')}
                </Button>
              </div>
            </div>
          ) : (
            /* Upload Button */
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={isUploading}
              className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 text-muted-foreground transition-all hover:border-primary hover:bg-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <span className="text-sm">{t('uploading')} {uploadProgress}%</span>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10" />
                  <span className="text-sm font-medium">{t('clickToUpload')}</span>
                  <span className="text-xs">{t('imageHint')}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </SettingsSection>
  )
}
