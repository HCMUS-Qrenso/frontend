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
import { Loader2 } from 'lucide-react'

interface CategoryUpsertModalProps {
  open: boolean
}

export function CategoryUpsertModal({ open }: CategoryUpsertModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') as 'create' | 'edit'
  const categoryId = searchParams.get('id')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  })

  const [errors, setErrors] = useState({
    name: '',
  })

  // Load data if editing
  useEffect(() => {
    if (mode === 'edit' && categoryId) {
      // TODO: Load category data
      setFormData({
        name: 'Khai vị',
        description: 'Các món khai vị truyền thống',
        is_active: true,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        is_active: true,
      })
    }
  }, [mode, categoryId])

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('modal')
    params.delete('mode')
    params.delete('id')
    router.push(`?${params.toString()}`)
    setFormData({ name: '', description: '', is_active: true })
    setErrors({ name: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({ name: '' })

    // Validation
    if (!formData.name.trim()) {
      setErrors({ name: 'Vui lòng nhập tên danh mục' })
      return
    }

    if (formData.name.length > 100) {
      setErrors({ name: 'Tên danh mục không được vượt quá 100 ký tự' })
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Submit to backend
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Success
      handleClose()
    } catch (error) {
      console.error('Error saving category:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Tạo danh mục mới để nhóm các món ăn theo loại'
              : 'Cập nhật thông tin danh mục'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên danh mục <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ví dụ: Khai vị, Món chính, Tráng miệng..."
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả ngắn về danh mục này..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <div className="space-y-0.5">
              <Label htmlFor="is_active" className="text-base">
                Hiển thị danh mục
              </Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Bật để hiển thị danh mục trong menu
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              disabled={isSubmitting}
            />
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
