'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Button } from '@/src/components/ui/button'
import { Upload, X, Loader2, HelpCircle } from 'lucide-react'
import { useUploadFiles } from '@/src/hooks/use-uploads'
import { toast } from 'sonner'
import { FieldHelp } from './field-help'
import { OnboardingDraft } from '../types'

interface StepRestaurantProps {
  data: OnboardingDraft['restaurant']
  onChange: (data: OnboardingDraft['restaurant']) => void
}

export function StepRestaurant({ data, onChange }: StepRestaurantProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadFiles, isUploading, progress } = useUploadFiles()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file tối đa 5MB')
        return
      }

      try {
        const objectUrl = URL.createObjectURL(file)
        setPreviewUrl(objectUrl)

        const results = await uploadFiles([file], { group: 'restaurant-images' })
        if (results.length > 0) {
          onChange({ ...data, image: results[0].url })
          toast.success('Tải ảnh thành công')
        }

        URL.revokeObjectURL(objectUrl)
        setPreviewUrl(null)
      } catch {
        toast.error('Lỗi tải ảnh')
        setPreviewUrl(null)
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [uploadFiles, onChange, data],
  )

  const handleRemoveImage = useCallback(() => {
    onChange({ ...data, image: null })
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }, [onChange, data, previewUrl])

  const displayImage = previewUrl || data.image

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Thông tin nhà hàng</h2>
        <p className="text-muted-foreground text-sm">
          Thông tin này sẽ hiển thị khi khách quét QR và trên hóa đơn
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column - Form fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="name">Tên nhà hàng *</Label>
              <FieldHelp
                title="Tên nhà hàng"
                description="Tên sẽ hiển thị trên trang menu, landing page khi quét QR, và hóa đơn."
                whereShown={['Menu header', 'QR landing page', 'Hóa đơn']}
                tip="Sử dụng tên thương hiệu chính thức của bạn"
                canSkip={false}
              />
            </div>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
              placeholder="VD: Phở Hà Nội"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="address">Địa chỉ *</Label>
              <FieldHelp
                title="Địa chỉ"
                description="Địa chỉ sẽ hiển thị trên hóa đơn và có thể giúp khách xác nhận đúng chi nhánh."
                whereShown={['Hóa đơn', 'Footer menu']}
                tip="Ghi đầy đủ số nhà, đường, quận/huyện"
                canSkip={false}
              />
            </div>
            <Input
              id="address"
              value={data.address}
              onChange={(e) => onChange({ ...data, address: e.target.value })}
              placeholder="VD: 123 Nguyễn Huệ, Q1, TP.HCM"
            />
          </div>
        </div>

        {/* Right column - Image upload */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Hình ảnh nhà hàng</Label>
            <FieldHelp
              title="Hình ảnh"
              description="Logo hoặc ảnh đại diện sẽ hiển thị trên trang landing khi khách quét QR."
              whereShown={['QR landing page']}
              tip="Sử dụng logo hoặc ảnh mặt tiền nhà hàng"
              canSkip={true}
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {displayImage ? (
            <div className="relative">
              <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-lg border">
                <Image
                  src={displayImage}
                  alt={data.name || 'Restaurant'}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="flex flex-col items-center gap-2 text-white">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="text-sm">{progress}%</span>
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
                  Đổi ảnh
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
                  Xóa
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={isUploading}
              className="border-muted-foreground/25 bg-muted/50 text-muted-foreground hover:border-primary hover:bg-muted hover:text-primary flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <span className="text-sm">Đang tải... {progress}%</span>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10" />
                  <span className="text-sm font-medium">Nhấn để tải ảnh</span>
                  <span className="text-xs">JPG, PNG, GIF - Tối đa 5MB</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
