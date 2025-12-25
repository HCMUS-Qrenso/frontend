'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'
import { Switch } from '@/src/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import {
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
} from '@/src/features/admin/menu/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { useUploadFiles } from '@/src/hooks/use-uploads'
import { toast } from 'sonner'
import { ModifierGroupSelector } from './menu-item-modifier-groups-selector'
import type { MenuItem, Category } from '@/src/features/admin/menu/types'
import { menuItemFormSchema } from '@/src/features/admin/menu/schemas'

interface MenuItemUpsertModalProps {
  open: boolean
  item: MenuItem | null
  categories: Category[]
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
}

export function MenuItemUpsertModal({
  open,
  item,
  categories,
  onOpenChange,
  mode,
}: MenuItemUpsertModalProps) {
  const { handleErrorWithStatus } = useErrorHandler()

  // Mutations
  const createMutation = useCreateMenuItemMutation()
  const updateMutation = useUpdateMenuItemMutation()
  const { uploadFiles, isUploading, progress: uploadProgress } = useUploadFiles()

  const isSubmitting = createMutation.isPending || updateMutation.isPending || isUploading
  const [images, setImages] = useState<{ url: string; is_primary: boolean; file?: File }[]>([])
  const [selectedPrimaryIndex, setSelectedPrimaryIndex] = useState<number>(0)
  const [selectedModifierGroupIds, setSelectedModifierGroupIds] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    base_price: '',
    description: '',
    preparation_time: '',
    status: 'available' as 'available' | 'unavailable' | 'sold_out',
    is_chef_recommendation: false,
    allergen_info: '',
    fat: '',
    carbs: '',
    protein: '',
    calories: '',
  })

  // Store original item data for comparison
  const [originalItemData, setOriginalItemData] = useState<MenuItem | null>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load data if editing
  useEffect(() => {
    if (mode === 'edit' && item) {
      setOriginalItemData(item) // Store original data for comparison

      setFormData({
        name: item.name,
        category_id: item.category?.id || '',
        base_price: item.base_price,
        description: item.description || '',
        preparation_time: item.preparation_time.toString(),
        status: item.status,
        is_chef_recommendation: item.is_chef_recommendation,
        allergen_info: item.allergen_info || '',
        fat: item.nutritional_info?.fat?.toString() || '',
        carbs: item.nutritional_info?.carbs?.toString() || '',
        protein: item.nutritional_info?.protein?.toString() || '',
        calories: item.nutritional_info?.calories?.toString() || '',
      })

      // Handle images - now backend returns objects with is_primary
      const loadedImages =
        item.images?.map((img) => ({
          url: img.image_url,
          is_primary: img.is_primary,
        })) || []
      setImages(loadedImages)
      const primaryIndex = loadedImages.findIndex((img) => img.is_primary)
      setSelectedPrimaryIndex(primaryIndex >= 0 ? primaryIndex : 0)

      setSelectedModifierGroupIds(item.modifier_groups?.map((g) => g.id) || [])
    } else if (mode === 'create') {
      setOriginalItemData(null)

      setFormData({
        name: '',
        category_id: '',
        base_price: '',
        description: '',
        preparation_time: '',
        status: 'available' as 'available' | 'unavailable' | 'sold_out',
        is_chef_recommendation: false,
        allergen_info: '',
        fat: '',
        carbs: '',
        protein: '',
        calories: '',
      })

      setImages([])

      setSelectedModifierGroupIds([])
    }
  }, [mode, item, categories])

  // Helper function to build payload with only changed fields
  const buildUpdatePayload = () => {
    if (!originalItemData) return {}

    const payload: any = {}

    // Compare each field with original data
    if (formData.name.trim() !== originalItemData.name) {
      payload.name = formData.name.trim()
    }

    if (formData.category_id !== originalItemData.category?.id) {
      payload.category_id = formData.category_id
    }

    if (formData.base_price !== originalItemData.base_price) {
      payload.base_price = formData.base_price
    }

    if ((formData.description || '').trim() !== (originalItemData.description || '')) {
      payload.description = formData.description.trim() || undefined
    }

    if (Number(formData.preparation_time) !== originalItemData.preparation_time) {
      payload.preparation_time = Number(formData.preparation_time)
    }

    if (formData.status !== originalItemData.status) {
      payload.status = formData.status
    }

    if (formData.is_chef_recommendation !== originalItemData.is_chef_recommendation) {
      payload.is_chef_recommendation = formData.is_chef_recommendation
    }

    if ((formData.allergen_info || '').trim() !== (originalItemData.allergen_info || '')) {
      payload.allergen_info = formData.allergen_info.trim() || undefined
    }

    if ((formData.fat || '') !== (originalItemData.nutritional_info?.fat?.toString() || '')) {
      payload.nutritional_info = payload.nutritional_info || {}
      payload.nutritional_info.fat = parseFloat(formData.fat) || 0
    }

    if ((formData.carbs || '') !== (originalItemData.nutritional_info?.carbs?.toString() || '')) {
      payload.nutritional_info = payload.nutritional_info || {}
      payload.nutritional_info.carbs = parseFloat(formData.carbs) || 0
    }

    if (
      (formData.protein || '') !== (originalItemData.nutritional_info?.protein?.toString() || '')
    ) {
      payload.nutritional_info = payload.nutritional_info || {}
      payload.nutritional_info.protein = parseFloat(formData.protein) || 0
    }

    if (
      (formData.calories || '') !== (originalItemData.nutritional_info?.calories?.toString() || '')
    ) {
      payload.nutritional_info = payload.nutritional_info || {}
      payload.nutritional_info.calories = parseFloat(formData.calories) || 0
    }

    if (
      (selectedModifierGroupIds || []).sort().toString() !==
      originalItemData.modifier_groups
        ?.map((g) => g.id)
        .sort()
        .toString()
    ) {
      payload.modifier_group_ids = selectedModifierGroupIds
    }

    // Images (image_urls) are handled separately in handleSubmit after S3 upload

    // Check if primary image index changed
    const originalPrimaryIndex = originalItemData.images?.findIndex((img) => img.is_primary) ?? 0
    if (selectedPrimaryIndex !== originalPrimaryIndex) {
      payload.primary_image_index = selectedPrimaryIndex
    }

    return payload
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate with Zod schema
    const result = menuItemFormSchema.safeParse(formData)

    if (!result.success) {
      // Convert Zod errors to our error format
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
      })
      setErrors(fieldErrors)

      // Show first error as toast for fields not displayed inline
      const firstError = result.error.issues[0]
      if (firstError && !['name', 'base_price'].includes(firstError.path[0] as string)) {
        toast.error(firstError.message)
      }
      return
    }

    try {
      // Upload new images to S3 first
      const newFiles = images.filter((img) => img.file).map((img) => img.file!)
      let uploadedUrls: string[] = []

      if (newFiles.length > 0) {
        const results = await uploadFiles(newFiles, { group: 'menu-images' })
        uploadedUrls = results.map((r) => r.url)
      }

      // Combine existing URLs (non-blob) with newly uploaded URLs
      const existingUrls = images
        .filter((img) => !img.file && !img.url.startsWith('blob:'))
        .map((img) => img.url)
      const allImageUrls = [...existingUrls, ...uploadedUrls]

      if (mode === 'create') {
        const payload = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          base_price: formData.base_price,
          preparation_time: Number(formData.preparation_time) || 0,
          status: formData.status,
          is_chef_recommendation: formData.is_chef_recommendation,
          allergen_info: formData.allergen_info.trim() || undefined,
          category_id: formData.category_id,
          nutritional_info: {
            fat: parseFloat(formData.fat) || 0,
            carbs: parseFloat(formData.carbs) || 0,
            protein: parseFloat(formData.protein) || 0,
            calories: parseFloat(formData.calories) || 0,
          },
          modifier_group_ids: selectedModifierGroupIds,
          image_urls: allImageUrls,
          primary_image_index: selectedPrimaryIndex,
        }
        await createMutation.mutateAsync(payload)
        toast.success('Đã tạo món ăn thành công')
      } else if (mode === 'edit' && item) {
        const payload = buildUpdatePayload()

        // Check if images changed and add to payload
        const originalUrls = (originalItemData?.images || []).map((img) => img.image_url).sort()
        const hasNewFiles = newFiles.length > 0
        const existingUrlsChanged =
          JSON.stringify(existingUrls.sort()) !== JSON.stringify(originalUrls)

        if (hasNewFiles || existingUrlsChanged) {
          payload.image_urls = allImageUrls
        }

        // If no changes (including images), don't send request
        if (Object.keys(payload).length === 0) {
          toast.info('Không có thay đổi nào để cập nhật')
          onOpenChange(false)
          return
        }

        await updateMutation.mutateAsync({
          id: item.id,
          payload,
        })
        toast.success('Đã cập nhật món ăn thành công')
      }

      // Success - close modal
      onOpenChange(false)
    } catch (error) {
      handleErrorWithStatus(error, undefined, 'Không thể lưu món ăn')
    }
  }

  const handleImageUpload = () => {
    // Trigger file input click
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.multiple = true
    fileInput.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        await handleFileSelect(target.files)
      }
    }
    fileInput.click()
  }

  const handleFileSelect = async (files: FileList) => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const maxFiles = 10

    // Validate number of files
    if (images.length + files.length > maxFiles) {
      toast.error(`Tối đa ${maxFiles} ảnh`)
      return
    }

    const validFiles: File[] = []

    // Validate each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} không phải là file ảnh`)
        continue
      }

      // Check file size
      if (file.size > maxSize) {
        toast.error(`${file.name} vượt quá 5MB`)
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    // Create object URLs for preview
    const newImages = validFiles.map((file, index) => ({
      url: URL.createObjectURL(file),
      is_primary: images.length === 0 && index === 0,
      file, // Store file for later upload
    }))

    setImages([...images, ...(newImages as any)])
    toast.success(`Đã thêm ${validFiles.length} ảnh`)
  }

  const handleRemoveImage = (index: number) => {
    // Revoke object URL to free memory
    if (images[index].url.startsWith('blob:')) {
      URL.revokeObjectURL(images[index].url)
    }

    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)

    // Adjust selectedPrimaryIndex
    if (index < selectedPrimaryIndex) {
      setSelectedPrimaryIndex(selectedPrimaryIndex - 1)
    } else if (index === selectedPrimaryIndex) {
      setSelectedPrimaryIndex(newImages.length > 0 ? 0 : 0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-175">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Thêm món mới' : 'Chỉnh sửa món'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Tạo món ăn mới cho menu' : 'Cập nhật thông tin món ăn'}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable content area - header and footer stay fixed */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <form id="menu-item-upsert-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Thông tin cơ bản
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Tên món <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Phở Bò Tái"
                    disabled={isSubmitting}
                  />
                  {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Danh mục</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => {
                      if (!value) return
                      setFormData((prev) => ({ ...prev, category_id: value }))
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder={'Chọn danh mục'} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Giá (VND) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    placeholder="85000"
                    disabled={isSubmitting}
                  />
                  {errors.base_price && <p className="text-xs text-red-600">{errors.base_price}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prep_time">Thời gian chuẩn bị (phút)</Label>
                  <Input
                    id="prep_time"
                    type="number"
                    value={formData.preparation_time}
                    onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
                    placeholder="15"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả ngắn về món ăn..."
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Divider */}
            <hr className="border-slate-200 dark:border-slate-700" />

            {/* Section 2: Operations */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Vận hành</h3>

              <div className="space-y-2">
                <Label htmlFor="status">
                  Trạng thái bán <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Đang bán</SelectItem>
                    <SelectItem value="unavailable">Tạm ẩn</SelectItem>
                    <SelectItem value="sold_out">Hết hàng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <div className="space-y-0.5">
                  <Label htmlFor="chef_pick" className="text-base">
                    Chef's recommendation
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Đánh dấu là món đặc biệt của đầu bếp
                  </p>
                </div>
                <Switch
                  id="chef_pick"
                  checked={formData.is_chef_recommendation}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_chef_recommendation: checked })
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Divider */}
            <hr className="border-slate-200 dark:border-slate-700" />

            {/* Section 3: Images */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ảnh món</h3>

              <div className="flex flex-wrap gap-3">
                {images.map((image, index) => {
                  const isPrimary = index === selectedPrimaryIndex
                  return (
                    <div key={index} className="group relative">
                      <button
                        type="button"
                        onClick={() => setSelectedPrimaryIndex(index)}
                        className={`relative h-24 w-24 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                          isPrimary
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-emerald-400 dark:border-slate-800 dark:hover:border-emerald-400'
                        }`}
                        title={isPrimary ? 'Ảnh chính (đã chọn)' : 'Nhấn để đặt làm ảnh chính'}
                      >
                        <Image
                          src={image.url || '/placeholder.svg'}
                          alt={`Image ${index + 1}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {isPrimary && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                          <span className="inline-flex items-center rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
                            Chính
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}

                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={isSubmitting || images.length >= 10}
                  className="flex h-24 w-24 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-500 dark:hover:bg-emerald-500/10"
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">Tải ảnh</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nhấn vào ảnh để đặt làm ảnh chính. Tải lên tối đa 10 ảnh (JPG, PNG, GIF). Kích thước
                tối đa 5MB mỗi ảnh.
              </p>
            </div>

            {/* Divider */}
            <hr className="border-slate-200 dark:border-slate-700" />

            {/* Section 4: Modifier Groups */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Tuỳ chọn món ăn (Modifiers)
              </h3>
              <ModifierGroupSelector
                selectedGroupIds={selectedModifierGroupIds}
                onChange={setSelectedModifierGroupIds}
                disabled={isSubmitting}
              />
            </div>

            {/* Divider */}
            <hr className="border-slate-200 dark:border-slate-700" />

            {/* Section 5: Allergens & Nutrition */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Allergens & Dinh dưỡng
              </h3>

              <div className="space-y-2">
                <Label htmlFor="allergen">Dị ứng</Label>
                <Textarea
                  id="allergen"
                  value={formData.allergen_info}
                  onChange={(e) => setFormData({ ...formData, allergen_info: e.target.value })}
                  placeholder="Ví dụ: Không chứa gluten, không chứa sữa..."
                  rows={2}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fat">Chất béo (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    value={formData.fat}
                    onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Fixed footer */}
        <div className="px-6 pb-6">
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="menu-item-upsert-form"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? `Đang upload... ${uploadProgress}%` : 'Đang lưu...'}
                </>
              ) : (
                'Lưu'
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
