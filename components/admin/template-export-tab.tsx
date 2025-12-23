'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, ImageIcon, Download, Eye, ZoomIn, ZoomOut, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Template = {
  id: string
  name: string
  thumbnail: string
  tags: string[]
  description: string
  format: string
}

const templates: Template[] = [
  {
    id: '1',
    name: 'Minimal A4 2-Column',
    thumbnail: '/placeholder.jpg',
    tags: ['A4', '2-col', 'Có ảnh'],
    description: 'Thiết kế tối giản, 2 cột, phù hợp menu có ảnh món',
    format: 'A4',
  },
  {
    id: '2',
    name: 'Photo-Forward Premium',
    thumbnail: '/placeholder.jpg',
    tags: ['A4', 'Ảnh lớn', 'Premium'],
    description: 'Ảnh món nổi bật, phong cách cao cấp',
    format: 'A4',
  },
  {
    id: '3',
    name: 'Chalkboard Dark',
    thumbnail: '/placeholder.jpg',
    tags: ['Dark', 'Vintage', 'Không ảnh'],
    description: 'Phong cách bảng đen cổ điển, không cần ảnh',
    format: 'A4',
  },
  {
    id: '4',
    name: 'Tri-Fold Classic',
    thumbnail: '/placeholder.jpg',
    tags: ['Tri-fold', '3-page', 'Compact'],
    description: 'Menu gấp 3, gọn gàng cho nhà hàng nhỏ',
    format: 'Letter',
  },
]

export function TemplateExportTab() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [zoom, setZoom] = useState(75)
  const [accentColor, setAccentColor] = useState('emerald')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="space-y-6">
      {!selectedTemplate ? (
        <>
          {/* Template Gallery */}
          <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Chọn template thiết kế
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Các mẫu menu đẹp, print-ready cho nhà hàng
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Badge variant="secondary" className="mr-2">
                    A4
                  </Badge>
                </Button>
                <Button variant="outline" size="sm">
                  <Badge variant="secondary" className="mr-2">
                    Có ảnh
                  </Badge>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="group overflow-hidden rounded-xl border border-slate-200 transition-all hover:border-emerald-500 hover:shadow-lg dark:border-slate-800 dark:hover:border-emerald-600 flex flex-col h-full"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={template.thumbnail || '/placeholder.jpg'}
                      alt={template.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="absolute right-4 bottom-4 left-4 flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          onClick={() => setShowPreview(true)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 className="font-medium text-slate-900 dark:text-white">{template.name}</h4>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex-1">
                      {template.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      onClick={() => setSelectedTemplate(template.id)}
                      className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700"
                      size="sm"
                    >
                      Dùng template này
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <>
          {/* Builder Interface */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {templates.find((t) => t.id === selectedTemplate)?.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Thiết kế menu của bạn</p>
            </div>
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
              Đổi template
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_1fr_320px]">
            {/* Left Panel: Data Source */}
            <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h4 className="mb-4 font-medium text-slate-900 dark:text-white">Nguồn dữ liệu</h4>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Tìm món ăn..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />

                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Danh mục</p>
                  <div className="space-y-1">
                    {['Món chính', 'Món phụ', 'Đồ uống', 'Tráng miệng'].map((cat) => (
                      <label key={cat} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-slate-700 dark:text-slate-300">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Trạng thái
                  </p>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-700 dark:text-slate-300">
                      Ẩn sold_out/unavailable
                    </span>
                  </label>
                </div>
              </div>
            </Card>

            {/* Middle: Preview */}
            <div className="space-y-4">
              <Card className="rounded-2xl border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">A4 • 210×297mm</Badge>
                    <Badge variant="secondary">Page 1/2</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setZoom(Math.max(50, zoom - 25))}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-slate-600 dark:text-slate-400">{zoom}%</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setZoom(Math.min(125, zoom + 25))}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Preview Canvas */}
                <div className="flex justify-center rounded-lg bg-slate-100 p-8 dark:bg-slate-800">
                  <div
                    className="bg-white shadow-2xl"
                    style={{
                      width: `${(210 * zoom) / 100}px`,
                      height: `${(297 * zoom) / 100}px`,
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: 'top',
                    }}
                  >
                    <div className="flex h-full flex-col p-8 text-xs">
                      <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold">Nhà hàng Việt</h1>
                        <p className="text-slate-600">
                          123 Nguyễn Huệ, Q.1, TP.HCM • 028 1234 5678
                        </p>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <h2 className="mb-2 border-b border-slate-200 pb-1 font-bold text-emerald-600">
                            Món chính
                          </h2>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Phở Bò Tái</span>
                              <span className="font-semibold">75.000đ</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Bún Chả Hà Nội</span>
                              <span className="font-semibold">55.000đ</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Panel: Style Controls */}
            <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h4 className="mb-4 font-medium text-slate-900 dark:text-white">Tuỳ chỉnh style</h4>
              <div className="space-y-6">
                {/* Theme */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Theme
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTheme('light')}
                      className={cn(
                        'rounded-lg border-2 p-3 text-sm transition-all',
                        theme === 'light'
                          ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10'
                          : 'border-slate-200 dark:border-slate-700',
                      )}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={cn(
                        'rounded-lg border-2 p-3 text-sm transition-all',
                        theme === 'dark'
                          ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10'
                          : 'border-slate-200 dark:border-slate-700',
                      )}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Màu nhấn
                  </label>
                  <div className="flex gap-2">
                    {['emerald', 'blue', 'amber', 'rose'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setAccentColor(color)}
                        className={cn(
                          'h-10 w-10 rounded-lg border-2 transition-all',
                          accentColor === color
                            ? 'scale-110 border-slate-900 dark:border-white'
                            : 'border-transparent',
                          color === 'emerald' && 'bg-emerald-500',
                          color === 'blue' && 'bg-blue-500',
                          color === 'amber' && 'bg-amber-500',
                          color === 'rose' && 'bg-rose-500',
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Header */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Thông tin nhà hàng
                  </label>
                  <input
                    type="text"
                    placeholder="Tên nhà hàng"
                    defaultValue="Nhà hàng Việt"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Địa chỉ"
                    defaultValue="123 Nguyễn Huệ, Q.1"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Hotline"
                    defaultValue="028 1234 5678"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Hiển thị
                  </label>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">Hiển thị giá</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">Hiển thị mô tả</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">
                        Icon Chef Recommend
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">QR code order</span>
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Export Actions */}
          <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Xuất menu</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Chọn format và chất lượng phù hợp
                </p>
              </div>
              <div className="flex gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Format <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      PDF (Print)
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      PNG (Images)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Chất lượng <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Standard (72 DPI)</DropdownMenuItem>
                    <DropdownMenuItem>High (300 DPI - In ấn)</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Download className="mr-2 h-4 w-4" />
                  Export Menu
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
