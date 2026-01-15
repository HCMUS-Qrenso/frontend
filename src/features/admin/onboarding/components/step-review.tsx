'use client'

import { Button } from '@/src/components/ui/button'
import { Check, Edit, Loader2 } from 'lucide-react'
import { OnboardingDraft, ONBOARDING_STEPS } from '../types'

interface StepReviewProps {
  draft: OnboardingDraft
  onEdit: (step: number) => void
  onComplete: () => void
  isCompleting: boolean
}

export function StepReview({ draft, onEdit, onComplete, isCompleting }: StepReviewProps) {
  const formatPrice = (amount: number | null) => {
    if (!amount) return 'Không giới hạn'
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ' + draft.locale.currency_symbol
  }

  const sections = [
    {
      step: 1,
      title: '🏪 Thông tin nhà hàng',
      items: [
        { label: 'Tên', value: draft.restaurant.name || '—' },
        { label: 'Địa chỉ', value: draft.restaurant.address || '—' },
        { label: 'Hình ảnh', value: draft.restaurant.image ? '✓ Đã tải lên' : 'Chưa có' },
      ],
      isComplete: !!draft.restaurant.name && !!draft.restaurant.address,
    },
    {
      step: 2,
      title: '🌐 Định dạng & Ngôn ngữ',
      items: [
        { label: 'Tiền tệ', value: `${draft.locale.currency} (${draft.locale.currency_symbol})` },
        { label: 'Múi giờ', value: draft.locale.timezone },
        { label: 'Ngôn ngữ', value: draft.locale.language.toUpperCase() },
      ],
      isComplete: !!draft.locale.currency,
    },
    {
      step: 3,
      title: '💰 Thuế & Phí dịch vụ',
      items: [
        {
          label: draft.tax_charge.tax_label,
          value: `${draft.tax_charge.tax_rate}% ${draft.tax_charge.tax_inclusive ? '(đã bao gồm)' : ''}`,
        },
        {
          label: 'Phí dịch vụ',
          value: draft.tax_charge.service_charge_enabled
            ? `${draft.tax_charge.service_charge_rate}%`
            : 'Không',
        },
      ],
      isComplete: true,
    },
    {
      step: 4,
      title: '🕐 Giờ hoạt động',
      items: [
        { label: 'Trạng thái', value: draft.hours.operating_hours ? '✓ Đã cấu hình' : 'Mặc định' },
      ],
      isComplete: true,
    },
    {
      step: 5,
      title: '📋 Quy tắc đặt hàng',
      items: [
        { label: 'Thời gian chuẩn bị', value: `${draft.order_rules.estimated_prep_time} phút` },
        { label: 'Giá trị tối thiểu', value: formatPrice(draft.order_rules.min_value) },
        { label: 'Session timeout', value: `${draft.order_rules.session_timeout_minutes} phút` },
      ],
      isComplete: true,
    },
  ]

  const requiredComplete = sections[0].isComplete && sections[1].isComplete

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Xác nhận cài đặt</h2>
        <p className="text-muted-foreground text-sm">
          Kiểm tra lại các thiết lập trước khi hoàn tất
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.step}
            className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{section.title}</span>
                {section.isComplete && <Check className="h-4 w-4 text-green-600" />}
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(section.step)}>
                <Edit className="mr-1 h-4 w-4" />
                Sửa
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {section.items.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-muted-foreground">{item.label}:</span>
                  <span className="ml-2 truncate font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!requiredComplete && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          ⚠️ Vui lòng hoàn thành các bước bắt buộc (Thông tin nhà hàng và Định dạng) trước khi hoàn
          tất.
        </div>
      )}

      <div className="bg-muted text-muted-foreground rounded-lg p-4 text-sm">
        💡 Bạn có thể chỉnh sửa tất cả cài đặt này sau trong trang <strong>Settings</strong>.
      </div>

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={onComplete}
          disabled={!requiredComplete || isCompleting}
          className="min-w-[200px]"
        >
          {isCompleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Hoàn tất & Vào Dashboard
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
