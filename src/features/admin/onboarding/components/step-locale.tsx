'use client'

import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { FieldHelp } from './field-help'
import { OnboardingDraft } from '../types'

interface StepLocaleProps {
  data: OnboardingDraft['locale']
  onChange: (data: OnboardingDraft['locale']) => void
}

const CURRENCIES = [
  { value: 'VND', symbol: '₫', label: 'Việt Nam Đồng (VND)' },
  { value: 'USD', symbol: '$', label: 'US Dollar (USD)' },
  { value: 'EUR', symbol: '€', label: 'Euro (EUR)' },
  { value: 'CNY', symbol: '¥', label: 'Chinese Yuan (CNY)' },
]

const TIMEZONES = [
  { value: 'Asia/Ho_Chi_Minh', label: 'Việt Nam (GMT+7)' },
  { value: 'America/New_York', label: 'New York (GMT-5/-4)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (GMT+8)' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1/+2)' },
]

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '09/01/2026' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '01/09/2026' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2026-01-09' },
]

// Languages must match files in /src/locales: vi.json, en.json, zh.json, fr.json
const LANGUAGES = [
  { value: 'vi', label: '🇻🇳 Tiếng Việt' },
  { value: 'en', label: '🇺🇸 English' },
  { value: 'zh', label: '🇨🇳 中文' },
  { value: 'fr', label: '🇫🇷 Français' },
]

// Quick presets - must use supported language values
const PRESETS = [
  {
    label: '🇻🇳 Việt Nam',
    values: {
      currency: 'VND',
      currency_symbol: '₫',
      timezone: 'Asia/Ho_Chi_Minh',
      date_format: 'DD/MM/YYYY',
      language: 'vi',
    },
  },
  {
    label: '🇺🇸 US',
    values: {
      currency: 'USD',
      currency_symbol: '$',
      timezone: 'America/New_York',
      date_format: 'MM/DD/YYYY',
      language: 'en',
    },
  },
  {
    label: '🇨🇳 China',
    values: {
      currency: 'CNY',
      currency_symbol: '¥',
      timezone: 'Asia/Shanghai',
      date_format: 'YYYY-MM-DD',
      language: 'zh',
    },
  },
  {
    label: '🇫🇷 France',
    values: {
      currency: 'EUR',
      currency_symbol: '€',
      timezone: 'Europe/Paris',
      date_format: 'DD/MM/YYYY',
      language: 'fr',
    },
  },
]

export function StepLocale({ data, onChange }: StepLocaleProps) {
  const handleCurrencyChange = (value: string) => {
    const currency = CURRENCIES.find((c) => c.value === value)
    onChange({
      ...data,
      currency: value,
      currency_symbol: currency?.symbol || data.currency_symbol,
    })
  }

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    onChange({ ...data, ...preset.values })
  }

  // Live preview
  const formatPrice = (amount: number) => {
    const formatter = new Intl.NumberFormat(data.language === 'vi' ? 'vi-VN' : 'en-US')
    return `${formatter.format(amount)} ${data.currency_symbol}`
  }

  const formatDate = () => {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()

    switch (data.date_format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`
      default:
        return `${day}/${month}/${year}`
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Định dạng & Ngôn ngữ</h2>
        <p className="text-muted-foreground text-sm">
          Cấu hình tiền tệ, múi giờ và ngôn ngữ hiển thị
        </p>
      </div>

      {/* Quick presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-sm">Chọn nhanh:</span>
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => applyPreset(preset)}
            className="hover:bg-muted rounded-full border px-3 py-1 text-sm transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Currency */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Tiền tệ *</Label>
            <FieldHelp
              title="Tiền tệ"
              description="Đơn vị tiền tệ hiển thị trên menu, cart và hóa đơn."
              whereShown={['Menu', 'Cart', 'Checkout', 'Hóa đơn']}
              canSkip={false}
              example={formatPrice(45000)}
            />
          </div>
          <Select value={data.currency} onValueChange={handleCurrencyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.symbol} {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Múi giờ *</Label>
            <FieldHelp
              title="Múi giờ"
              description="Ảnh hưởng đến thời gian hiển thị đơn hàng và giờ hoạt động."
              whereShown={['Dashboard', 'Orders', 'Reports']}
              canSkip={false}
            />
          </div>
          <Select value={data.timezone} onValueChange={(v) => onChange({ ...data, timezone: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Format */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Định dạng ngày</Label>
            <FieldHelp
              title="Định dạng ngày"
              description="Cách hiển thị ngày tháng trên dashboard và reports."
              whereShown={['Dashboard', 'Reports', 'Orders']}
              canSkip={false}
              example={formatDate()}
            />
          </div>
          <Select
            value={data.date_format}
            onValueChange={(v) => onChange({ ...data, date_format: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_FORMATS.map((df) => (
                <SelectItem key={df.value} value={df.value}>
                  {df.label} ({df.example})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Ngôn ngữ *</Label>
            <FieldHelp
              title="Ngôn ngữ"
              description="Ngôn ngữ hiển thị của admin dashboard."
              whereShown={['Admin Panel']}
              canSkip={false}
            />
          </div>
          <Select value={data.language} onValueChange={(v) => onChange({ ...data, language: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-muted/50 rounded-lg border p-4">
        <p className="mb-2 text-sm font-medium">Preview</p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Giá:</span>
            <span className="ml-2 font-medium">{formatPrice(45000)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Ngày:</span>
            <span className="ml-2 font-medium">{formatDate()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Giờ:</span>
            <span className="ml-2 font-medium">14:30</span>
          </div>
        </div>
      </div>
    </div>
  )
}
