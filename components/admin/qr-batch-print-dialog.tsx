"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, FileText } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface QRBatchPrintDialogProps {
  selectedCount: number
  totalCount: number
  onClose: () => void
}

export function QRBatchPrintDialog({ selectedCount, totalCount, onClose }: QRBatchPrintDialogProps) {
  const [scope, setScope] = useState<"all" | "area" | "selected">("all")
  const [layout, setLayout] = useState("4")
  const [showTableNumber, setShowTableNumber] = useState(true)
  const [showLogo, setShowLogo] = useState(true)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <Button variant="ghost" size="icon" className="absolute right-4 top-4 rounded-full" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>

        {/* Content */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Batch Print QR Codes</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Tạo file PDF để in hàng loạt QR code cho bàn</p>
          </div>

          {/* Scope Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Phạm vi in</Label>
            <RadioGroup value={scope} onValueChange={(v) => setScope(v as typeof scope)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="scope-all" />
                <Label htmlFor="scope-all" className="font-normal">
                  All tables ({totalCount} bàn)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="area" id="scope-area" />
                <Label htmlFor="scope-area" className="font-normal">
                  Current area
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="selected" id="scope-selected" disabled={selectedCount === 0} />
                <Label htmlFor="scope-selected" className="font-normal">
                  Selected tables ({selectedCount} bàn)
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
            <Button variant="outline" className="flex-1 rounded-full bg-transparent" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1 gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600">
              <FileText className="h-4 w-4" />
              Generate PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
