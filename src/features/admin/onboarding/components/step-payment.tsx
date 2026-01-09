'use client'

import { useState } from 'react'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Button } from '@/src/components/ui/button'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Eye, EyeOff, AlertTriangle, Download, ExternalLink } from 'lucide-react'
import { FieldHelp } from './field-help'
import { OnboardingDraft } from '../types'

interface StepPaymentProps {
  data: OnboardingDraft['payment']
  onChange: (data: OnboardingDraft['payment']) => void
}

export function StepPayment({ data, onChange }: StepPaymentProps) {
  const [showClientId, setShowClientId] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showChecksumKey, setShowChecksumKey] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Thanh toán QR (PayOS)</h2>
        <p className="text-sm text-muted-foreground">
          Cấu hình PayOS API để nhận thanh toán QR từ khách hàng (có thể bỏ qua)
        </p>
      </div>

      {/* Warning Alert */}
      <Alert className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Thông tin API này rất quan trọng. Không chia sẻ với người khác để tránh mất tiền.
        </AlertDescription>
      </Alert>

      {/* Quick Links */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => window.open('https://payos.vn', '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
          Đăng ký PayOS
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => {
            const link = document.createElement('a')
            link.href = '/s3-storage/docs/payos-setup.pdf'
            link.download = 'payos-setup-instructions.pdf'
            link.target = '_blank'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }}
        >
          <Download className="h-4 w-4" />
          Hướng dẫn cài đặt
        </Button>
      </div>

      <div className="space-y-4">
        {/* PayOS Client ID */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="payos_client_id">Client ID</Label>
            <FieldHelp
              title="PayOS Client ID"
              description="Mã định danh duy nhất cho tài khoản PayOS của bạn."
              whereShown={['Xử lý thanh toán']}
              tip="Lấy từ dashboard PayOS → Settings → API Keys"
              canSkip={true}
            />
          </div>
          <div className="relative">
            <Input
              id="payos_client_id"
              type={showClientId ? 'text' : 'password'}
              value={data.payos_client_id || ''}
              onChange={(e) => onChange({ ...data, payos_client_id: e.target.value || null })}
              placeholder="Nhập Client ID"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 h-full px-3 py-0 hover:bg-transparent"
              onClick={() => setShowClientId(!showClientId)}
            >
              {showClientId ? (
                <EyeOff className="text-muted-foreground h-4 w-4" />
              ) : (
                <Eye className="text-muted-foreground h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* PayOS API Key */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="payos_api_key">API Key</Label>
            <FieldHelp
              title="PayOS API Key"
              description="Khóa xác thực để gọi API PayOS."
              whereShown={['Xử lý thanh toán']}
              tip="Tạo mới trong dashboard PayOS"
              canSkip={true}
            />
          </div>
          <div className="relative">
            <Input
              id="payos_api_key"
              type={showApiKey ? 'text' : 'password'}
              value={data.payos_api_key || ''}
              onChange={(e) => onChange({ ...data, payos_api_key: e.target.value || null })}
              placeholder="Nhập API Key"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 h-full px-3 py-0 hover:bg-transparent"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? (
                <EyeOff className="text-muted-foreground h-4 w-4" />
              ) : (
                <Eye className="text-muted-foreground h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* PayOS Checksum Key */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="payos_checksum_key">Checksum Key</Label>
            <FieldHelp
              title="PayOS Checksum Key"
              description="Khóa bí mật để xác thực webhook từ PayOS."
              whereShown={['Xác thực webhook']}
              tip="Tạo mới trong dashboard PayOS"
              canSkip={true}
            />
          </div>
          <div className="relative">
            <Input
              id="payos_checksum_key"
              type={showChecksumKey ? 'text' : 'password'}
              value={data.payos_checksum_key || ''}
              onChange={(e) => onChange({ ...data, payos_checksum_key: e.target.value || null })}
              placeholder="Nhập Checksum Key"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 h-full px-3 py-0 hover:bg-transparent"
              onClick={() => setShowChecksumKey(!showChecksumKey)}
            >
              {showChecksumKey ? (
                <EyeOff className="text-muted-foreground h-4 w-4" />
              ) : (
                <Eye className="text-muted-foreground h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
        <p className="font-medium mb-2">💡 Chưa có tài khoản PayOS?</p>
        <p>
          Bạn có thể bỏ qua bước này và cấu hình sau trong Settings → Thanh toán QR. 
          Tính năng thanh toán QR sẽ bị vô hiệu cho đến khi cấu hình đầy đủ.
        </p>
      </div>
    </div>
  )
}
