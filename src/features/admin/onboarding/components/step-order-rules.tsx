'use client'

import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Switch } from '@/src/components/ui/switch'
import { FieldHelp } from './field-help'
import { OnboardingDraft } from '../types'

interface StepOrderRulesProps {
  data: OnboardingDraft['order_rules']
  onChange: (data: OnboardingDraft['order_rules']) => void
  currencySymbol: string
}

// Quick presets
const PRESETS = [
  {
    label: '🍜 Quick Service',
    desc: '10 phút, không tối thiểu',
    values: {
      min_value: null,
      estimated_prep_time: 10,
      allow_special_instructions: true,
      session_timeout_minutes: 60,
      require_guest_count: false,
    },
  },
  {
    label: '🍽️ Full Service',
    desc: '20 phút, 100k tối thiểu',
    values: {
      min_value: 100000,
      estimated_prep_time: 20,
      allow_special_instructions: true,
      session_timeout_minutes: 180,
      require_guest_count: true,
    },
  },
  {
    label: '🥡 Takeaway',
    desc: '15 phút, 50k tối thiểu',
    values: {
      min_value: 50000,
      estimated_prep_time: 15,
      allow_special_instructions: true,
      session_timeout_minutes: 30,
      require_guest_count: false,
    },
  },
]

export function StepOrderRules({ data, onChange, currencySymbol }: StepOrderRulesProps) {
  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    onChange({ ...data, ...preset.values })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Quy tắc đặt hàng</h2>
        <p className="text-muted-foreground text-sm">
          Cấu hình thời gian, giá trị tối thiểu và các quy tắc khác
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
            title={preset.desc}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Prep Time */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="prep_time">Thời gian chuẩn bị (phút)</Label>
            <FieldHelp
              title="Thời gian chuẩn bị"
              description="Thời gian ước tính để chuẩn bị món ăn. Dùng cho món không có thời gian riêng."
              whereShown={['KDS', 'Order confirmation']}
              tip="Quán ăn nhanh: 10-15 phút, Nhà hàng: 20-30 phút"
              canSkip={true}
            />
          </div>
          <Input
            id="prep_time"
            type="number"
            min={1}
            max={120}
            value={data.estimated_prep_time}
            onChange={(e) => onChange({ ...data, estimated_prep_time: Number(e.target.value) })}
          />
        </div>

        {/* Min Order Value */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="min_value">Giá trị đơn tối thiểu ({currencySymbol})</Label>
            <FieldHelp
              title="Giá trị tối thiểu"
              description="Đơn hàng phải đạt giá trị tối thiểu này mới được đặt. Để trống = không giới hạn."
              whereShown={['Cart', 'Checkout']}
              tip="Để trống nếu không cần giới hạn"
              canSkip={true}
            />
          </div>
          <Input
            id="min_value"
            type="number"
            min={0}
            value={data.min_value || ''}
            onChange={(e) =>
              onChange({ ...data, min_value: e.target.value ? Number(e.target.value) : null })
            }
            placeholder="Không giới hạn"
          />
        </div>

        {/* Session Timeout */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="session_timeout">Session timeout (phút)</Label>
            <FieldHelp
              title="Session timeout"
              description="Sau thời gian này không có hoạt động, khách cần quét QR lại để tiếp tục."
              whereShown={['Customer app']}
              tip="60-120 phút cho quán ăn, 180+ phút cho fine dining"
              canSkip={true}
            />
          </div>
          <Input
            id="session_timeout"
            type="number"
            min={15}
            max={480}
            value={data.session_timeout_minutes}
            onChange={(e) => onChange({ ...data, session_timeout_minutes: Number(e.target.value) })}
          />
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="special_instructions">Cho phép ghi chú món</Label>
              <FieldHelp
                title="Ghi chú đặc biệt"
                description="Cho phép khách thêm ghi chú cho từng món (VD: không hành, ít cay)."
                whereShown={['Menu', 'Cart', 'KDS']}
                canSkip={true}
              />
            </div>
            <Switch
              id="special_instructions"
              checked={data.allow_special_instructions}
              onCheckedChange={(checked) =>
                onChange({ ...data, allow_special_instructions: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="require_guest">Yêu cầu nhập số khách</Label>
              <FieldHelp
                title="Số khách"
                description="Bắt buộc khách nhập số người khi bắt đầu session. Dùng cho tính phí phục vụ theo bàn."
                whereShown={['QR landing']}
                canSkip={true}
              />
            </div>
            <Switch
              id="require_guest"
              checked={data.require_guest_count}
              onCheckedChange={(checked) => onChange({ ...data, require_guest_count: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
