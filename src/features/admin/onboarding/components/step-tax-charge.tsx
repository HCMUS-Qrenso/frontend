'use client'

import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Switch } from '@/src/components/ui/switch'
import { FieldHelp } from './field-help'
import { OnboardingDraft } from '../types'

interface StepTaxChargeProps {
  data: OnboardingDraft['tax_charge']
  onChange: (data: OnboardingDraft['tax_charge']) => void
  currencySymbol: string
}

// Quick presets
const PRESETS = [
  {
    label: '🏪 Quán ăn nhỏ',
    desc: 'VAT 10%, không phí phục vụ',
    values: { tax_rate: 10, tax_inclusive: true, tax_label: 'VAT', service_charge_enabled: false, service_charge_rate: 5, service_charge_taxable: false, service_charge_min_party: null },
  },
  {
    label: '🍽️ Nhà hàng',
    desc: 'VAT 10%, 5% phí phục vụ',
    values: { tax_rate: 10, tax_inclusive: true, tax_label: 'VAT', service_charge_enabled: true, service_charge_rate: 5, service_charge_taxable: false, service_charge_min_party: null },
  },
  {
    label: '🏨 Fine Dining',
    desc: 'VAT 10%, 10% phí cho bàn 6+',
    values: { tax_rate: 10, tax_inclusive: true, tax_label: 'VAT', service_charge_enabled: true, service_charge_rate: 10, service_charge_taxable: false, service_charge_min_party: 6 },
  },
]

export function StepTaxCharge({ data, onChange, currencySymbol }: StepTaxChargeProps) {
  const applyPreset = (preset: typeof PRESETS[0]) => {
    onChange({ ...data, ...preset.values })
  }

  // Live preview calculation
  const subtotal = 450000
  const serviceAmount = data.service_charge_enabled ? subtotal * (data.service_charge_rate / 100) : 0
  const taxableAmount = subtotal + (data.service_charge_taxable ? serviceAmount : 0)
  const taxAmount = taxableAmount * (data.tax_rate / 100)
  const total = data.tax_inclusive 
    ? subtotal + serviceAmount 
    : subtotal + serviceAmount + taxAmount

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' ' + currencySymbol
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Thuế & Phí dịch vụ</h2>
        <p className="text-sm text-muted-foreground">
          Cấu hình VAT và phí phục vụ (có thể bỏ qua và dùng mặc định)
        </p>
      </div>

      {/* Quick presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Chọn nhanh:</span>
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => applyPreset(preset)}
            className="rounded-full border px-3 py-1 text-sm hover:bg-muted transition-colors"
            title={preset.desc}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tax Settings */}
        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="font-medium">Thuế VAT</h3>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="tax_rate">Thuế suất (%)</Label>
              <FieldHelp
                title="Thuế suất"
                description="Phần trăm thuế VAT áp dụng cho đơn hàng."
                whereShown={['Checkout', 'Hóa đơn']}
                tip="Thuế VAT tiêu chuẩn ở Việt Nam là 10%"
                canSkip={true}
              />
            </div>
            <Input
              id="tax_rate"
              type="number"
              min={0}
              max={100}
              value={data.tax_rate}
              onChange={(e) => onChange({ ...data, tax_rate: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="tax_label">Tên hiển thị</Label>
              <FieldHelp
                title="Tên thuế"
                description="Nhãn hiển thị trên hóa đơn, VD: VAT, GST."
                whereShown={['Checkout', 'Hóa đơn']}
                canSkip={true}
              />
            </div>
            <Input
              id="tax_label"
              value={data.tax_label}
              onChange={(e) => onChange({ ...data, tax_label: e.target.value })}
              placeholder="VAT"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="tax_inclusive">Giá đã bao gồm thuế</Label>
              <FieldHelp
                title="Thuế đã bao gồm"
                description="Nếu BẬT: giá trên menu đã bao gồm thuế. Nếu TẮT: thuế sẽ cộng thêm vào tổng."
                whereShown={['Menu', 'Cart', 'Checkout']}
                tip="Hầu hết nhà hàng VN dùng giá đã bao gồm thuế"
                canSkip={true}
              />
            </div>
            <Switch
              id="tax_inclusive"
              checked={data.tax_inclusive}
              onCheckedChange={(checked) => onChange({ ...data, tax_inclusive: checked })}
            />
          </div>
        </div>

        {/* Service Charge Settings */}
        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Phí dịch vụ</h3>
            <Switch
              checked={data.service_charge_enabled}
              onCheckedChange={(checked) => onChange({ ...data, service_charge_enabled: checked })}
            />
          </div>

          {data.service_charge_enabled && (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="sc_rate">Tỉ lệ (%)</Label>
                  <FieldHelp
                    title="Phí dịch vụ"
                    description="Phần trăm phí phục vụ tính trên subtotal."
                    whereShown={['Checkout', 'Hóa đơn']}
                    canSkip={true}
                  />
                </div>
                <Input
                  id="sc_rate"
                  type="number"
                  min={0}
                  max={100}
                  value={data.service_charge_rate}
                  onChange={(e) => onChange({ ...data, service_charge_rate: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="sc_min_party">Số khách tối thiểu</Label>
                  <FieldHelp
                    title="Số khách tối thiểu"
                    description="Chỉ áp dụng phí phục vụ khi số khách >= giá trị này. Để trống = áp dụng cho tất cả."
                    whereShown={['Checkout']}
                    tip="Fine dining thường áp dụng cho bàn 6+ người"
                    canSkip={true}
                  />
                </div>
                <Input
                  id="sc_min_party"
                  type="number"
                  min={0}
                  value={data.service_charge_min_party || ''}
                  onChange={(e) => onChange({ ...data, service_charge_min_party: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Tất cả bàn"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="sc_taxable">Tính thuế trên phí phục vụ</Label>
                  <FieldHelp
                    title="Phí phục vụ chịu thuế"
                    description="Nếu BẬT: thuế sẽ tính cả trên phí phục vụ."
                    whereShown={['Hóa đơn']}
                    canSkip={true}
                  />
                </div>
                <Switch
                  id="sc_taxable"
                  checked={data.service_charge_taxable}
                  onCheckedChange={(checked) => onChange({ ...data, service_charge_taxable: checked })}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-sm font-medium mb-3">Preview hóa đơn</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tạm tính:</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {data.service_charge_enabled && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phí dịch vụ ({data.service_charge_rate}%):</span>
              <span>{formatPrice(serviceAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {data.tax_label} ({data.tax_rate}%){data.tax_inclusive && ' (đã bao gồm)'}:
            </span>
            <span>{data.tax_inclusive ? `(${formatPrice(taxAmount)})` : formatPrice(taxAmount)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-medium">
            <span>Tổng cộng:</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
