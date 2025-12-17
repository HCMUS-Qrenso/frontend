'use client'

import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  X,
  FileWarning,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ImportStep = 1 | 2 | 3 | 4
type ImportMode = 'create' | 'update' | 'upsert'
type DataType =
  | 'categories'
  | 'items'
  | 'images'
  | 'modifier_groups'
  | 'modifiers'
  | 'item_modifiers'

interface UploadedFile {
  name: string
  size: number
  type: string
  sheets?: string[]
}

export function ImportTab() {
  const [currentStep, setCurrentStep] = useState<ImportStep>(1)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [importMode, setImportMode] = useState<ImportMode>('create')
  const [selectedDataTypes, setSelectedDataTypes] = useState<Set<DataType>>(new Set())
  const [isValidating, setIsValidating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const steps = [
    { number: 1, title: 'Upload file', description: 'Chọn file CSV hoặc Excel' },
    { number: 2, title: 'Chọn dữ liệu', description: 'Loại dữ liệu muốn import' },
    { number: 3, title: 'Map columns', description: 'Ánh xạ cột và rules' },
    { number: 4, title: 'Preview & Import', description: 'Kiểm tra và thực hiện' },
  ]

  const dataTypeOptions: { value: DataType; label: string; description: string; icon: string }[] = [
    {
      value: 'categories',
      label: 'Danh mục',
      description: 'Categories cho menu',
      icon: '📁',
    },
    {
      value: 'items',
      label: 'Món ăn',
      description: 'Menu items với giá, mô tả',
      icon: '🍽️',
    },
    {
      value: 'images',
      label: 'Hình ảnh món',
      description: 'URLs ảnh cho items',
      icon: '🖼️',
    },
    {
      value: 'modifier_groups',
      label: 'Nhóm tuỳ chọn',
      description: 'Modifier groups',
      icon: '⚙️',
    },
    {
      value: 'modifiers',
      label: 'Tuỳ chọn',
      description: 'Các option trong groups',
      icon: '✨',
    },
    {
      value: 'item_modifiers',
      label: 'Liên kết Item-Modifier',
      description: 'Mapping items với groups',
      icon: '🔗',
    },
  ]

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        sheets: file.name.endsWith('.xlsx') ? ['Sheet1', 'Categories', 'Items'] : undefined,
      })
    }
  }

  const toggleDataType = (type: DataType) => {
    setSelectedDataTypes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(type)) {
        newSet.delete(type)
      } else {
        newSet.add(type)
      }
      return newSet
    })
  }

  const handleValidate = () => {
    setIsValidating(true)
    setTimeout(() => {
      setIsValidating(false)
      setCurrentStep(4)
    }, 2000)
  }

  const handleImport = () => {
    setIsImporting(true)
    setTimeout(() => {
      setIsImporting(false)
      // Show success
    }, 3000)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex flex-1 items-center">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-colors',
                    currentStep >= step.number
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600',
                  )}
                >
                  {currentStep > step.number ? <CheckCircle2 className="h-5 w-5" /> : step.number}
                </div>
                <div className="hidden md:block">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      currentStep >= step.number
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-400 dark:text-slate-600',
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">{step.description}</p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-4 h-0.5 flex-1 transition-colors',
                    currentStep > step.number ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800',
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Step 1: Upload File */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            {!uploadedFile ? (
              <label className="group block cursor-pointer">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-8 py-12 transition-colors group-hover:border-emerald-400 group-hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:group-hover:border-emerald-600 dark:group-hover:bg-emerald-500/5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <Upload className="h-8 w-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-slate-900 dark:text-white">
                      Kéo thả file vào đây hoặc click để chọn
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Hỗ trợ CSV, XLSX (tối đa 10MB)
                    </p>
                  </div>
                </div>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {uploadedFile.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                    {uploadedFile.sheets && (
                      <div className="mt-2">
                        <p className="text-xs text-slate-500 dark:text-slate-500">Sheets:</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {uploadedFile.sheets.map((sheet) => (
                            <Badge key={sheet} variant="secondary" className="text-xs">
                              {sheet}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setUploadedFile(null)}
                    className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Chế độ import
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { value: 'create', label: 'Tạo mới', description: 'Chỉ tạo records mới' },
                      { value: 'update', label: 'Cập nhật', description: 'Cập nhật theo khóa' },
                      { value: 'upsert', label: 'Upsert', description: 'Tạo hoặc cập nhật' },
                    ].map((mode) => (
                      <button
                        key={mode.value}
                        onClick={() => setImportMode(mode.value as ImportMode)}
                        className={cn(
                          'rounded-xl border-2 p-4 text-left transition-all',
                          importMode === mode.value
                            ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10'
                            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
                        )}
                      >
                        <p className="font-medium text-slate-900 dark:text-white">{mode.label}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {mode.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Download Template */}
          <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Download className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-slate-900 dark:text-white">Tải file mẫu</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Download template CSV/Excel để xem cấu trúc cột đúng
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Categories.csv
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Items.xlsx
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Modifiers.csv
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={() => setCurrentStep(2)}
              disabled={!uploadedFile}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Tiếp theo
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Data Types */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
              Chọn loại dữ liệu muốn import
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dataTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleDataType(option.value)}
                  className={cn(
                    'rounded-xl border-2 p-4 text-left transition-all',
                    selectedDataTypes.has(option.value)
                      ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{option.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">{option.label}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {option.description}
                      </p>
                    </div>
                    {selectedDataTypes.has(option.value) && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {selectedDataTypes.has('items') && !selectedDataTypes.has('categories') && (
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-500/5">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium">Khuyến nghị</p>
                  <p className="mt-1">
                    Nên import Categories trước khi import Items để tránh lỗi tham chiếu
                  </p>
                </div>
              </div>
            )}
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            <Button
              onClick={() => setCurrentStep(3)}
              disabled={selectedDataTypes.size === 0}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Tiếp theo
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Map Columns */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
              Ánh xạ cột dữ liệu
            </h3>
            <div className="space-y-4">
              {/* Mock mapping table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">
                        Cột trong file
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">
                        Field hệ thống
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">
                        Preview (3 dòng)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-3 text-slate-900 dark:text-white">ten_mon</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">name</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        Phở Bò, Bún Chả, Cơm Tấm
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-900 dark:text-white">gia</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">base_price</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        75000, 55000, 45000
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-900 dark:text-white">category</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">category_id</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        Món chính, Món chính, Cơm
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <h4 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Rules & Options
                </h4>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-600 dark:text-slate-400">Trim khoảng trắng</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-600 dark:text-slate-400">
                      Chuyển đổi giá tiền (loại bỏ dấu phẩy, chấm)
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-600 dark:text-slate-400">
                      Đặt status = 'available' nếu trống
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            <Button
              onClick={handleValidate}
              disabled={isValidating}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isValidating ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang validate...
                </>
              ) : (
                <>
                  Validate & Tiếp theo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Preview & Import */}
      {currentStep === 4 && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card className="rounded-xl border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">142</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Hợp lệ</p>
                </div>
              </div>
            </Card>
            <Card className="rounded-xl border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">8</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Lỗi</p>
                </div>
              </div>
            </Card>
            <Card className="rounded-xl border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">120</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tạo mới</p>
                </div>
              </div>
            </Card>
            <Card className="rounded-xl border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <FileWarning className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">22</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Cập nhật</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Preview Table */}
          <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">Preview dữ liệu</h3>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Xuất file lỗi (.csv)
              </Button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">
                      #
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">
                      Tên món
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">
                      Giá
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr>
                    <td className="px-4 py-3 text-slate-500">1</td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white">Phở Bò Tái</td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white">75,000đ</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">Món chính</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        OK
                      </Badge>
                    </td>
                  </tr>
                  <tr className="bg-rose-50/50 dark:bg-rose-500/5">
                    <td className="px-4 py-3 text-slate-500">2</td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white">Bún Chả</td>
                    <td className="px-4 py-3 text-rose-600 dark:text-rose-400">invalid</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">Món chính</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="destructive">Giá không hợp lệ</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-500">3</td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white">Cơm Tấm</td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white">45,000đ</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">Cơm</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        OK
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(3)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            <div className="flex gap-3">
              <Button variant="outline">Bỏ qua lỗi & Import</Button>
              <Button
                onClick={handleImport}
                disabled={isImporting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isImporting ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang import...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import ngay
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
