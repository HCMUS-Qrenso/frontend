'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, FileText, Loader2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { tablesApi } from '@/lib/api/tables'
import { downloadBlob } from '@/lib/utils/download'
import { toast } from 'sonner'
import { useErrorHandler } from '@/hooks/use-error-handler'

interface QRBatchPrintDialogProps {
  selectedCount: number
  totalCount: number
  onClose: () => void
  onGenerate?: (forceRegenerate: boolean) => void
  isLoading?: boolean
}

export function QRBatchPrintDialog({
  selectedCount,
  totalCount,
  onClose,
  onGenerate,
  isLoading = false,
}: QRBatchPrintDialogProps) {
  const [scope, setScope] = useState<'all' | 'area' | 'selected'>('all')
  const [layout, setLayout] = useState('4')
  const [showTableNumber, setShowTableNumber] = useState(true)
  const [showLogo, setShowLogo] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const { handleError } = useErrorHandler()

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const blob = await tablesApi.downloadAllQR()
      downloadBlob(blob, 'qr-codes.zip')
      toast.success('Đã tải xuống tất cả QR codes')
      onClose()
    } catch (error: any) {
      handleError(error, 'Có lỗi xảy ra khi tải xuống QR codes')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 rounded-full"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Content */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              In hàng loạt mã QR
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Tạo file PDF để in hàng loạt QR code cho bàn
            </p>
          </div>

          {/* Scope Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Phạm vi in</Label>
            <RadioGroup value={scope} onValueChange={(v) => setScope(v as typeof scope)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="scope-all" />
                <Label htmlFor="scope-all" className="font-normal">
                  Tất cả bàn ({totalCount} bàn)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="area" id="scope-area" />
                <Label htmlFor="scope-area" className="font-normal">
                  Khu vực hiện tại
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="selected"
                  id="scope-selected"
                  disabled={selectedCount === 0}
                />
                <Label htmlFor="scope-selected" className="font-normal">
                  Bàn đã chọn ({selectedCount} bàn)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Layout Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Layout in</Label>
            <RadioGroup value={layout} onValueChange={setLayout}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="layout-4" />
                <Label htmlFor="layout-4" className="font-normal">
                  4 QR per page (khổ lớn, dễ scan)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="6" id="layout-6" />
                <Label htmlFor="layout-6" className="font-normal">
                  6 QR per page (cân bằng)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="10" id="layout-10" />
                <Label htmlFor="layout-10" className="font-normal">
                  10 QR per page (tiết kiệm giấy)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tùy chọn hiển thị</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-table-number"
                  checked={showTableNumber}
                  onCheckedChange={(checked) => setShowTableNumber(checked as boolean)}
                />
                <Label htmlFor="show-table-number" className="font-normal">
                  Hiển thị số bàn dưới QR
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-logo"
                  checked={showLogo}
                  onCheckedChange={(checked) => setShowLogo(checked as boolean)}
                />
                <Label htmlFor="show-logo" className="font-normal">
                  Hiển thị logo nhà hàng
                </Label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-full bg-transparent"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            {onGenerate && (
              <Button
                variant="outline"
                className="flex-1 gap-2 rounded-full bg-transparent"
                onClick={() => onGenerate(false)}
                disabled={isLoading || selectedCount === 0}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                Tạo QR
              </Button>
            )}
            <Button
              className="flex-1 gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600"
              onClick={handleDownload}
              disabled={isDownloading || isLoading}
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {isDownloading ? 'Đang tải...' : 'Tải xuống ZIP'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
