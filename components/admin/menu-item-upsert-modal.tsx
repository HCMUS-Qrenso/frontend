'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Upload, X, LinkIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface MenuItemUpsertModalProps {
  open: boolean
}

export function MenuItemUpsertModal({ open }: MenuItemUpsertModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') as 'create' | 'edit'
  const itemId = searchParams.get('id')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<{ url: string; is_primary: boolean }[]>([])
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    base_price: '',
    description: '',
    preparation_time: '',
    status: 'available' as 'available' | 'unavailable' | 'sold_out',
    is_chef_recommendation: false,
    allergen_info: '',
    nutritional_info: '',
  })

  const [errors, setErrors] = useState({
    name: '',
    base_price: '',
  })

  // Load data if editing
  useEffect(() => {
    if (mode === 'edit' && itemId) {
      // TODO: Load item data from API
      setFormData({
        name: 'Phở Bò Tái',
        category_id: '2',
        base_price: '85000',
        description: 'Phở bò tái truyền thống Hà Nội',
        preparation_time: '15',
        status: 'available',
        is_chef_recommendation: true,
        allergen_info: 'Không',
        nutritional_info: 'Calories: 450, Protein: 25g',
      })
      setImages([{ url: '/pho-bo.jpg', is_primary: true }])
    } else {
      setFormData({
        name: '',
        category_id: '',
        base_price: '',
        description: '',
        preparation_time: '',
        status: 'available',
        is_chef_recommendation: false,
        allergen_info: '',
        nutritional_info: '',
      })
      setImages([])
    }
  }, [mode, itemId])

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('modal')
    params.delete('mode')
    params.delete('id')
    router.push(`?${params.toString()}`)
    setFormData({
      name: '',
      category_id: '',
      base_price: '',
      description: '',
      preparation_time: '',
      status: 'available',
      is_chef_recommendation: false,
      allergen_info: '',
      nutritional_info: '',
    })
    setImages([])
    setErrors({ name: '', base_price: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({ name: '', base_price: '' })

    // Validation
    const newErrors = { name: '', base_price: '' }
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên món'
    }
    if (!formData.base_price || Number(formData.base_price) <= 0) {
      newErrors.base_price = 'Vui lòng nhập giá hợp lệ'
    }

    if (newErrors.name || newErrors.base_price) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Submit to backend API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Success
      handleClose()
    } catch (error) {
      console.error('Error saving menu item:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = () => {
    // TODO: Implement image upload
    const newImage = {
      url: '/vietnamese-food.jpg',
      is_primary: images.length === 0,
    }
    setImages([...images, newImage])
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSetPrimaryImage = (index: number) => {
    setImages(images.map((img, i) => ({ ...img, is_primary: i === index })))
  }

  const handleModifiersLink = () => {
    router.push('/admin/menu/modifiers')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Thêm món mới' : 'Chỉnh sửa món'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Tạo món ăn mới cho menu' : 'Cập nhật thông tin món ăn'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Info */}
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
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Khai vị</SelectItem>
                    <SelectItem value="2">Món chính</SelectItem>
                    <SelectItem value="3">Tráng miệng</SelectItem>
                    <SelectItem value="4">Đồ uống</SelectItem>
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

          {/* Section 3: Images */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ảnh món</h3>

            <div className="flex flex-wrap gap-3">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <div
                    className={cn(
                      'relative h-24 w-24 overflow-hidden rounded-lg border-2',
                      image.is_primary
                        ? 'border-emerald-500'
                        : 'border-slate-200 dark:border-slate-800',
                    )}
                  >
                    <Image
                      src={image.url || '/placeholder.svg'}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {!image.is_primary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryImage(index)}
                      className="absolute right-0 bottom-0 left-0 bg-black/60 py-1 text-xs text-white hover:bg-black/80"
                    >
                      Đặt chính
                    </button>
                  )}
                  {image.is_primary && (
                    <div className="absolute right-0 bottom-0 left-0 bg-emerald-500 py-1 text-center text-xs text-white">
                      Ảnh chính
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleImageUpload}
                className="flex h-24 w-24 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-500 dark:hover:bg-emerald-500/10"
              >
                <Upload className="h-5 w-5" />
                <span className="text-xs">Upload</span>
              </button>
            </div>
          </div>

          {/* Section 4: Allergens & Nutrition */}
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

            <div className="space-y-2">
              <Label htmlFor="nutrition">Dinh dưỡng</Label>
              <Input
                id="nutrition"
                value={formData.nutritional_info}
                onChange={(e) => setFormData({ ...formData, nutritional_info: e.target.value })}
                placeholder="Ví dụ: Calories: 450, Protein: 25g, Fat: 15g"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Section 5: Modifiers Hook */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Nhóm tuỳ chọn (Modifiers)
            </h3>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                Chưa có nhóm tuỳ chọn nào. Vui lòng tạo nhóm tuỳ chọn trước.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={handleModifiersLink}>
                <LinkIcon className="mr-2 h-4 w-4" />
                Quản lý nhóm tuỳ chọn
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
