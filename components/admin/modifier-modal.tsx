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
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import {
  useCreateModifierMutation,
  useUpdateModifierMutation,
  useModifiersQuery,
} from '@/hooks/use-modifiers-query'
import { useErrorHandler } from '@/hooks/use-error-handler'
import { toast } from 'sonner'

interface ModifierModalProps {
  open: boolean
  selectedGroupId: string | null
}

export function ModifierModal({ open, selectedGroupId }: ModifierModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') as 'create' | 'edit'
  const modifierId = searchParams.get('id')
  const { handleErrorWithStatus } = useErrorHandler()

  // Mutations
  const createMutation = useCreateModifierMutation()
  const updateMutation = useUpdateModifierMutation()

  // Fetch modifiers to get data for editing
  const { data: modifiersData } = useModifiersQuery(
    selectedGroupId,
    { include_unavailable: true },
    open && mode === 'edit' && !!selectedGroupId,
  )

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const [formData, setFormData] = useState({
    name: '',
    price_adjustment: 0,
    is_available: true,
  })

  const [errors, setErrors] = useState({
    name: '',
  })

  // Load data if editing
  useEffect(() => {
    if (mode === 'edit' && modifierId && modifiersData?.data.modifiers) {
      const modifier = modifiersData.data.modifiers.find((m) => m.id === modifierId)
      if (modifier) {
        setFormData({
          name: modifier.name,
          price_adjustment: modifier.price_adjustment,
          is_available: modifier.is_available,
        })
      }
    } else if (mode === 'create') {
      setFormData({
        name: '',
        price_adjustment: 0,
        is_available: true,
      })
    }
  }, [mode, modifierId, modifiersData])

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('modal')
    params.delete('mode')
    params.delete('id')
    router.push(`?${params.toString()}`)
    setErrors({ name: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({ name: '' })

    // Validation
    if (!formData.name.trim()) {
      setErrors({ name: 'Vui lòng nhập tên option' })
      return
    }

    if (formData.name.length > 100) {
      setErrors({ name: 'Tên option không được vượt quá 100 ký tự' })
      return
    }

    if (!selectedGroupId) {
      toast.error('Vui lòng chọn nhóm trước')
      return
    }

    const payload = {
      name: formData.name,
      price_adjustment: formData.price_adjustment,
      is_available: formData.is_available,
    }

    if (mode === 'create') {
      createMutation.mutate(
        { groupId: selectedGroupId, payload },
        {
          onSuccess: () => {
            toast.success('Đã tạo option')
            handleClose()
          },
          onError: (error) => {
            handleErrorWithStatus(error)
            toast.error('Không thể tạo option')
          },
        },
      )
    } else if (mode === 'edit' && modifierId) {
      updateMutation.mutate(
        { id: modifierId, groupId: selectedGroupId, payload },
        {
          onSuccess: () => {
            toast.success('Đã cập nhật option')
            handleClose()
          },
          onError: (error) => {
            handleErrorWithStatus(error)
            toast.error('Không thể cập nhật option')
          },
        },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Thêm option mới' : 'Chỉnh sửa option'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Tạo tuỳ chọn mới cho nhóm' : 'Cập nhật thông tin tuỳ chọn'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên option <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ví dụ: Lớn (Large), Phô mai thêm..."
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* Price Adjustment */}
          <div className="space-y-2">
            <Label htmlFor="price">Điều chỉnh giá</Label>
            <div className="relative">
              <Input
                id="price"
                type="number"
                value={formData.price_adjustment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price_adjustment: Number.parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
                disabled={isSubmitting}
                className="pr-12"
              />
              <div className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-500">
                đ
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Số dương để tăng giá, số âm để giảm giá. Để 0 nếu không thay đổi.
            </p>
          </div>

          {/* Available Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <div className="space-y-0.5">
              <Label htmlFor="is_available" className="text-base">
                Có sẵn
              </Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tắt nếu tạm thời hết hàng
              </p>
            </div>
            <Switch
              id="is_available"
              checked={formData.is_available}
              onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
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
