'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { useExportMenuMutation, useCategoriesQuery } from '@/src/features/admin/menu/queries'
import { toast } from 'sonner'
import { useErrorHandler } from '@/src/hooks/use-error-handler'

type ExportScope = 'all' | 'category'
type ExportFormat = 'csv' | 'xlsx'

export function ExportDataTab() {
  const [exportScope, setExportScope] = useState<ExportScope>('all')
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [includeImages, setIncludeImages] = useState(true)
  const [includeModifiers, setIncludeModifiers] = useState(true)
  const [includeHidden, setIncludeHidden] = useState(false)

  const { handleErrorWithStatus } = useErrorHandler()
  const exportMutation = useExportMenuMutation()
  const { data: categoriesData } = useCategoriesQuery({ limit: 100 })
  const categories = categoriesData?.data.categories || []

  const handleExport = async () => {
    if (exportScope === 'category' && !selectedCategory) {
      toast.error('Vui lòng chọn danh mục')
      return
    }

    try {
      await exportMutation.mutateAsync({
        format,
        scope: exportScope,
        categoryId: exportScope === 'category' ? selectedCategory : undefined,
        includeImages,
        includeModifiers,
        includeHidden,
      })
      toast.success('Đã xuất file thành công')
    } catch (error) {
      handleErrorWithStatus(error, undefined, 'Không thể xuất file')
    }
  }

  return (
    <div className="space-y-6">
      {/* Export Scope */}
      <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Phạm vi xuất dữ liệu</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              value: 'all',
              label: 'Tất cả',
              description: 'Toàn bộ menu items',
            },
            {
              value: 'category',
              label: 'Theo danh mục',
              description: 'Chọn một category cụ thể',
            },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setExportScope(option.value as ExportScope)}
              className={cn(
                'rounded-xl border-2 p-4 text-left transition-all',
                exportScope === option.value
                  ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
              )}
            >
              <p className="font-medium text-slate-900 dark:text-white">{option.label}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {option.description}
              </p>
            </button>
          ))}
        </div>

        {/* Category Selector */}
        {exportScope === 'category' && (
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Chọn danh mục
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Chọn danh mục..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </Card>

      {/* Export Options */}
      <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Tùy chọn xuất</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={includeImages}
              onChange={(e) => setIncludeImages(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                Include images
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">Xuất URLs ảnh món ăn</p>
            </div>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={includeModifiers}
              onChange={(e) => setIncludeModifiers(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                Include modifiers
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Xuất modifier groups (JSON)
              </p>
            </div>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={includeHidden}
              onChange={(e) => setIncludeHidden(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                Include hidden items
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Xuất cả items có status = unavailable
              </p>
            </div>
          </label>
        </div>
      </Card>

      {/* Format Selection */}
      <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Định dạng file</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setFormat('csv')}
            className={cn(
              'flex flex-1 items-center gap-3 rounded-xl border-2 p-4 transition-all',
              format === 'csv'
                ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10'
                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
            )}
          >
            <FileSpreadsheet className="h-8 w-8 text-slate-400" />
            <div className="text-left">
              <p className="font-medium text-slate-900 dark:text-white">CSV</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Nhỏ gọn, dễ xử lý</p>
            </div>
          </button>
          <button
            onClick={() => setFormat('xlsx')}
            className={cn(
              'flex flex-1 items-center gap-3 rounded-xl border-2 p-4 transition-all',
              format === 'xlsx'
                ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10'
                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
            )}
          >
            <FileSpreadsheet className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <div className="text-left">
              <p className="font-medium text-slate-900 dark:text-white">Excel (.xlsx)</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Format đẹp hơn</p>
            </div>
          </button>
        </div>
      </Card>

      {/* Export Action */}
      <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Sẵn sàng export</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              File sẽ được tải xuống tự động
            </p>
          </div>
          <Button
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {exportMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang export...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
