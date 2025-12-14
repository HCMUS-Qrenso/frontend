'use client'

import type React from 'react'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Loader2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

interface TableUpsertDrawerProps {
  open: boolean
}

interface TableFormData {
  table_number: string
  capacity: string
  floor: string
  shape: string
  status: 'available' | 'occupied' | 'maintenance'
  is_active: boolean
  autoGenerateQR: boolean
}

const initialFormData: TableFormData = {
  table_number: '',
  capacity: '4',
  floor: 'Tầng 1',
  shape: 'circle',
  status: 'available',
  is_active: true,
  autoGenerateQR: true,
}

export function TableUpsertDrawer({ open }: TableUpsertDrawerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') as 'create' | 'edit' | null
  const tableId = searchParams.get('id')

  const [formData, setFormData] = useState<TableFormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof TableFormData, string>>>({})
  const [isLoading, setIsLoading] = useState(false)

  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const scrollYRef = useRef<number>(0)

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
    }
  }, [open])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      // Save current scroll position
      scrollYRef.current = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollYRef.current}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'

      return () => {
        // Restore scroll position
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollYRef.current)
      }
    }
  }, [open])

  // Load table data when editing
  useEffect(() => {
    if (mode === 'edit' && tableId && open) {
      // Mock loading existing table data
      // In production, fetch from API: const data = await fetch(`/api/tables/${tableId}`)
      setFormData({
        table_number: tableId,
        capacity: '4',
        floor: 'Tầng 1',
        shape: 'rectangle',
        status: 'available',
        is_active: true,
        autoGenerateQR: false,
      })
    } else if (mode === 'create' && open) {
      setFormData(initialFormData)
    }
  }, [mode, tableId, open])

  const closeDrawer = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('modal')
    params.delete('mode')
    params.delete('id')
    router.push(`/admin/tables/list?${params.toString()}`)
    setFormData(initialFormData)
    setErrors({})

    setTimeout(() => {
      previousFocusRef.current?.focus()
    }, 100)
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TableFormData, string>> = {}

    if (!formData.table_number.trim()) {
      newErrors.table_number = 'Vui lòng nhập tên/số bàn'
    }

    const capacityNum = Number.parseInt(formData.capacity)
    if (!formData.capacity || isNaN(capacityNum) || capacityNum <= 0) {
      newErrors.capacity = 'Số ghế phải lớn hơn 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In production:
      // const endpoint = mode === "create" ? "/api/tables" : `/api/tables/${tableId}`
      // const method = mode === "create" ? "POST" : "PUT"
      // await fetch(endpoint, { method, body: JSON.stringify(formData) })

      // Success feedback
      console.log('[v0] Table saved:', formData)

      // Close drawer and show success toast
      closeDrawer()

      // In production, trigger refresh of table list
      // mutate('/api/tables')
    } catch (error) {
      console.error('[v0] Error saving table:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !isLoading) {
        closeDrawer()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open, isLoading])

  useEffect(() => {
    if (!open) return

    const modal = document.querySelector('[role="dialog"]') as HTMLElement
    if (!modal) return

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          e.preventDefault()
        }
      }
    }

    modal.addEventListener('keydown', handleTab)
    firstElement?.focus()

    return () => modal.removeEventListener('keydown', handleTab)
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Overlay - Click to close only when not loading */}
      <div
        className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm"
        onClick={() => !isLoading && closeDrawer()}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        className="fixed top-1/2 left-1/2 z-70 flex max-h-[90vh] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        {/* Header - Sticky */}
        <div className="flex items-start justify-between border-b border-slate-200 p-6 dark:border-slate-800">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold text-slate-900 dark:text-white">
              {mode === 'create' ? 'Thêm bàn mới' : 'Chỉnh sửa bàn'}
            </h2>
            <p id="modal-description" className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {mode === 'create'
                ? 'Điền đầy đủ thông tin để thêm bàn mới vào hệ thống'
                : 'Cập nhật thông tin bàn trong form bên dưới'}
            </p>
          </div>
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            onClick={closeDrawer}
            disabled={isLoading}
            className="h-9 w-9 rounded-full"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {/* Table Number */}
            <div className="space-y-2">
              <Label htmlFor="table_number">
                Tên / Số bàn <span className="text-red-500">*</span>
              </Label>
              <Input
                id="table_number"
                value={formData.table_number}
                onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                placeholder="Ví dụ: 1, A1, VIP01"
                className={errors.table_number ? 'border-red-500' : ''}
                aria-invalid={!!errors.table_number}
                aria-describedby={errors.table_number ? 'table_number-error' : undefined}
              />
              {errors.table_number && (
                <p id="table_number-error" className="text-sm text-red-500" role="alert">
                  {errors.table_number}
                </p>
              )}
            </div>

            {/* Floor / Area */}
            <div className="space-y-2">
              <Label htmlFor="floor">Khu vực / Tầng</Label>
              <Select
                value={formData.floor}
                onValueChange={(value) => setFormData({ ...formData, floor: value })}
              >
                <SelectTrigger id="floor">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-80">
                  <SelectItem value="Tầng 1">Tầng 1</SelectItem>
                  <SelectItem value="Tầng 2">Tầng 2</SelectItem>
                  <SelectItem value="Tầng 3">Tầng 3</SelectItem>
                  <SelectItem value="Khu ngoài trời">Khu ngoài trời</SelectItem>
                  <SelectItem value="Khu VIP">Khu VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <Label htmlFor="capacity">
                Số ghế <span className="text-red-500">*</span>
              </Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="4"
                className={errors.capacity ? 'border-red-500' : ''}
                aria-invalid={!!errors.capacity}
                aria-describedby={errors.capacity ? 'capacity-error' : undefined}
              />
              {errors.capacity && (
                <p id="capacity-error" className="text-sm text-red-500" role="alert">
                  {errors.capacity}
                </p>
              )}
            </div>

            {/* Shape */}
            <div className="space-y-2">
              <Label htmlFor="shape">Hình dạng</Label>
              <Select
                value={formData.shape}
                onValueChange={(value) => setFormData({ ...formData, shape: value })}
              >
                <SelectTrigger id="shape">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-80">
                  <SelectItem value="circle">Tròn</SelectItem>
                  <SelectItem value="rectangle">Chữ nhật</SelectItem>
                  <SelectItem value="oval">Oval</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái (vận hành)</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as TableFormData['status'] })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-80">
                  <SelectItem value="available">Trống</SelectItem>
                  <SelectItem value="occupied">Đang sử dụng</SelectItem>
                  <SelectItem value="maintenance">Bảo trì</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Trạng thái vận hành của bàn (Trống, Đang sử dụng, Bảo trì)
              </p>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="space-y-0.5">
                <Label htmlFor="is_active" className="cursor-pointer">
                  Kích hoạt bàn
                </Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Bàn có thể được sử dụng và hiển thị
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            {/* Auto Generate QR - Only show in create mode */}
            {mode === 'create' && (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="space-y-0.5">
                  <Label htmlFor="autoGenerateQR" className="cursor-pointer">
                    Tự động tạo QR sau khi lưu
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Tạo mã QR ngay sau khi thêm bàn
                  </p>
                </div>
                <Switch
                  id="autoGenerateQR"
                  checked={formData.autoGenerateQR}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, autoGenerateQR: checked })
                  }
                />
              </div>
            )}

            {/* Show table ID in edit mode (read-only) */}
            {mode === 'edit' && tableId && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <Label className="text-xs text-slate-500 dark:text-slate-400">
                  ID bàn (read-only)
                </Label>
                <p className="mt-1 font-mono text-sm text-slate-700 dark:text-slate-300">
                  {tableId}
                </p>
              </div>
            )}
          </div>

          {/* Footer - Sticky */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-6 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={closeDrawer}
              disabled={isLoading}
              className="rounded-full"
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Đang lưu...' : 'Lưu bàn'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
