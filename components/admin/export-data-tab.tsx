"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, FileSpreadsheet, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type ExportScope = "all" | "category" | "available_only"
type ExportFormat = "csv" | "xlsx"

export function ExportDataTab() {
  const [exportScope, setExportScope] = useState<ExportScope>("all")
  const [format, setFormat] = useState<ExportFormat>("xlsx")
  const [includeImages, setIncludeImages] = useState(true)
  const [includeModifiers, setIncludeModifiers] = useState(true)
  const [includeHidden, setIncludeHidden] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [lastExport, setLastExport] = useState<string | null>("2024-12-15 14:30")

  const handleExport = () => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      setLastExport(new Date().toLocaleString("vi-VN"))
      // Mock download
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Export Scope */}
      <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Phạm vi xuất dữ liệu</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { value: "all", label: "Tất cả", description: "Toàn bộ categories + items + modifiers" },
            { value: "category", label: "Theo danh mục", description: "Chọn một category cụ thể" },
            { value: "available_only", label: "Chỉ đang bán", description: "Items có status = available" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setExportScope(option.value as ExportScope)}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-all",
                exportScope === option.value
                  ? "border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10"
                  : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700",
              )}
            >
              <p className="font-medium text-slate-900 dark:text-white">{option.label}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{option.description}</p>
            </button>
          ))}
        </div>
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
              <span className="text-sm font-medium text-slate-900 dark:text-white">Include images</span>
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
              <span className="text-sm font-medium text-slate-900 dark:text-white">Include modifier mapping</span>
              <p className="text-xs text-slate-500 dark:text-slate-400">Xuất liên kết item ↔ modifier groups</p>
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
              <span className="text-sm font-medium text-slate-900 dark:text-white">Include hidden categories</span>
              <p className="text-xs text-slate-500 dark:text-slate-400">Xuất cả categories có is_active=false</p>
            </div>
          </label>
        </div>
      </Card>

      {/* Format Selection */}
      <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Định dạng file</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setFormat("csv")}
            className={cn(
              "flex flex-1 items-center gap-3 rounded-xl border-2 p-4 transition-all",
              format === "csv"
                ? "border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10"
                : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700",
            )}
          >
            <FileSpreadsheet className="h-8 w-8 text-slate-400" />
            <div className="text-left">
              <p className="font-medium text-slate-900 dark:text-white">CSV</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Nhỏ gọn, dễ xử lý</p>
            </div>
          </button>
          <button
            onClick={() => setFormat("xlsx")}
            className={cn(
              "flex flex-1 items-center gap-3 rounded-xl border-2 p-4 transition-all",
              format === "xlsx"
                ? "border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10"
                : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700",
            )}
          >
            <FileSpreadsheet className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <div className="text-left">
              <p className="font-medium text-slate-900 dark:text-white">Excel (.xlsx)</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Nhiều sheets, format đẹp</p>
            </div>
          </button>
        </div>
      </Card>

      {/* Export Actions */}
      <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Sẵn sàng export</h3>
            {lastExport && (
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Clock className="h-4 w-4" />
                <span>Lần cuối: {lastExport}</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" disabled={isExporting}>
              Copy link
            </Button>
            <Button onClick={handleExport} disabled={isExporting} className="bg-emerald-600 hover:bg-emerald-700">
              {isExporting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
        </div>
      </Card>

      {/* Export History */}
      <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Lịch sử export gần đây</h3>
        <div className="space-y-3">
          {[
            { name: "menu-export-all-20241215.xlsx", date: "15/12/2024 14:30", size: "2.4 MB" },
            { name: "categories-20241210.csv", date: "10/12/2024 09:15", size: "156 KB" },
            { name: "menu-available-20241208.xlsx", date: "08/12/2024 16:45", size: "1.8 MB" },
          ].map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{file.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {file.date} • {file.size}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
