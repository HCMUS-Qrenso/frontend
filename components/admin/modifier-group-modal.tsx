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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2 } from 'lucide-react'
import type { ModifierGroupType } from '@/types/modifiers'
import {
  useCreateModifierGroupMutation,
  useUpdateModifierGroupMutation,
  useModifierGroupQuery,
} from '@/hooks/use-modifiers-query'
import { useErrorHandler } from '@/hooks/use-error-handler'
import { toast } from 'sonner'

interface ModifierGroupModalProps {
  open: boolean
}

export function ModifierGroupModal({ open }: ModifierGroupModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') as 'create' | 'edit'
  const groupId = searchParams.get('id')
  const { handleErrorWithStatus } = useErrorHandler()

  // Mutations
  const createMutation = useCreateModifierGroupMutation()
  const updateMutation = useUpdateModifierGroupMutation()

  // Fetch existing group data if editing
  const { data: groupData, isLoading: isLoadingGroup } = useModifierGroupQuery(
    groupId,
    false,
    open && mode === 'edit' && !!groupId,
  )

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const [formData, setFormData] = useState<{
    name: string
    type: ModifierGroupType
    is_required: boolean
    min_selections: number
    max_selections: number | null
  }>({
    name: '',
    type: 'single_choice',
    is_required: false,
    min_selections: 0,
    max_selections: 1,
  })

  const [errors, setErrors] = useState({
    name: '',
    selections: '',
  })

  // Load data if editing
  useEffect(() => {
    if (mode === 'edit' && groupData?.data.modifier_group) {
      const group = groupData.data.modifier_group
      setFormData({
        name: group.name,
        type: group.type,
        is_required: group.is_required,
        min_selections: group.min_selections,
        max_selections: group.max_selections,
      })
    } else if (mode === 'create') {
      setFormData({
        name: '',
        type: 'single_choice',
        is_required: false,
        min_selections: 0,
        max_selections: 1,
      })
    }
  }, [mode, groupData])

  // Auto-adjust min/max based on type and required
  useEffect(() => {
    if (formData.type === 'single_choice') {
      setFormData((prev) => ({
        ...prev,
        max_selections: 1,
        min_selections: prev.is_required ? 1 : 0,
      }))
    } else if (formData.is_required && formData.min_selections === 0) {
      setFormData((prev) => ({ ...prev, min_selections: 1 }))
    }
  }, [formData.type, formData.is_required])

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('modal')
    params.delete('mode')
    params.delete('id')
    router.push(`?${params.toString()}`)
    setErrors({ name: '', selections: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({ name: '', selections: '' })

    // Validation
    if (!formData.name.trim()) {
      setErrors({ name: 'Vui lòng nhập tên nhóm', selections: '' })
      return
    }

    if (formData.name.length > 100) {
      setErrors({ name: 'Tên nhóm không được vượt quá 100 ký tự', selections: '' })
      return
    }

    if (formData.max_selections !== null && formData.min_selections > formData.max_selections) {
      setErrors({ name: '', selections: 'Số lượng tối thiểu không được lớn hơn tối đa' })
      return
    }

    const payload = {
      name: formData.name,
      type: formData.type,
      is_required: formData.is_required,
      min_selections: formData.min_selections,
      max_selections: formData.max_selections,
    }

    if (mode === 'create') {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Đã tạo nhóm tuỳ chọn')
          handleClose()
        },
        onError: (error) => {
          handleErrorWithStatus(error)
          toast.error('Không thể tạo nhóm')
        },
      })
    } else if (mode === 'edit' && groupId) {
      updateMutation.mutate(
        { id: groupId, payload },
        {
          onSuccess: () => {
            toast.success('Đã cập nhật nhóm tuỳ chọn')
            handleClose()
          },
          onError: (error) => {
            handleErrorWithStatus(error)
            toast.error('Không thể cập nhật nhóm')
          },
        },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Tạo nhóm tuỳ chọn mới' : 'Chỉnh sửa nhóm tuỳ chọn'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Tạo nhóm mới để phân loại các tuỳ chọn (Size, Topping, Độ chín...)'
              : 'Cập nhật thông tin nhóm tuỳ chọn'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'edit' && isLoadingGroup ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên nhóm <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ví dụ: Kích cỡ, Topping, Độ chín..."
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* Type */}
            <div className="space-y-3">
              <Label>
                Loại lựa chọn <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as 'single_choice' | 'multiple_choice' })
                }
                disabled={isSubmitting}
              >
                <div className="flex items-center space-x-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <RadioGroupItem value="single_choice" id="single" />
                  <Label htmlFor="single" className="flex-1 cursor-pointer font-normal">
                    <div className="font-medium">Single Choice</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Chỉ chọn được 1 option (VD: Size)
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <RadioGroupItem value="multiple_choice" id="multiple" />
                  <Label htmlFor="multiple" className="flex-1 cursor-pointer font-normal">
                    <div className="font-medium">Multiple Choice</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Chọn được nhiều option (VD: Topping)
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Required */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <div className="space-y-0.5">
                <Label htmlFor="is_required" className="text-base">
                  Bắt buộc chọn
                </Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Khách hàng phải chọn ít nhất 1 option
                </p>
              </div>
              <Switch
                id="is_required"
                checked={formData.is_required}
                onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
                disabled={isSubmitting}
              />
            </div>

            {/* Min/Max Selections */}
            {formData.type === 'multiple_choice' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min">Số lượng tối thiểu</Label>
                  <Input
                    id="min"
                    type="number"
                    min={0}
                    value={formData.min_selections}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        min_selections: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max">Số lượng tối đa</Label>
                  <div className="flex gap-2">
                    <Input
                      id="max"
                      type="number"
                      min={1}
                      value={formData.max_selections || ''}
                      onChange={(e) => {
                        const val = e.target.value ? Number.parseInt(e.target.value) : null
                        setFormData({ ...formData, max_selections: val })
                      }}
                      placeholder="Không giới hạn"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            )}
            {errors.selections && <p className="text-xs text-red-600">{errors.selections}</p>}

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
        )}
      </DialogContent>
    </Dialog>
  )
}
