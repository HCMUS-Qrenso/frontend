// Onboarding Types

export interface OnboardingDraft {
  current_step: number
  completed_steps: number[]
  
  // Step 1: Restaurant
  restaurant: {
    name: string
    address: string
    image: string | null
  }
  
  // Step 2: Locale
  locale: {
    currency: string
    currency_symbol: string
    timezone: string
    date_format: string
    language: string
  }
  
  // Step 3: Tax & Charges
  tax_charge: {
    tax_rate: number
    tax_inclusive: boolean
    tax_label: string
    service_charge_enabled: boolean
    service_charge_rate: number
    service_charge_taxable: boolean
    service_charge_min_party: number | null
  }
  
  // Step 4: Operating Hours
  hours: {
    operating_hours: Record<string, {
      isOpen: boolean
      slots: Array<{ open: string; close: string }>
    }>
  }
  
  // Step 5: Order Rules
  order_rules: {
    min_value: number | null
    estimated_prep_time: number
    allow_special_instructions: boolean
    session_timeout_minutes: number
    require_guest_count: boolean
  }
  
  // Step 6: Payment (PayOS)
  payment: {
    payos_client_id: string | null
    payos_api_key: string | null
    payos_checksum_key: string | null
  }
}

export interface OnboardingResponse {
  success: boolean
  data: {
    completed: boolean
    draft: OnboardingDraft | null
    current_settings: OnboardingDraft
  }
}

export interface OnboardingStep {
  id: number
  key: string
  title: string
  description: string
  icon: string
  required: boolean
  canSkip: boolean
}

// Default values
export const DEFAULT_ONBOARDING_DRAFT: OnboardingDraft = {
  current_step: 1,
  completed_steps: [],
  restaurant: {
    name: '',
    address: '',
    image: null,
  },
  locale: {
    currency: 'VND',
    currency_symbol: '₫',
    timezone: 'Asia/Ho_Chi_Minh',
    date_format: 'DD/MM/YYYY',
    language: 'vi',
  },
  tax_charge: {
    tax_rate: 10,
    tax_inclusive: true,
    tax_label: 'VAT',
    service_charge_enabled: false,
    service_charge_rate: 5,
    service_charge_taxable: false,
    service_charge_min_party: null,
  },
  hours: {
    operating_hours: {
      monday: { isOpen: true, slots: [{ open: '09:00', close: '22:00' }] },
      tuesday: { isOpen: true, slots: [{ open: '09:00', close: '22:00' }] },
      wednesday: { isOpen: true, slots: [{ open: '09:00', close: '22:00' }] },
      thursday: { isOpen: true, slots: [{ open: '09:00', close: '22:00' }] },
      friday: { isOpen: true, slots: [{ open: '09:00', close: '23:00' }] },
      saturday: { isOpen: true, slots: [{ open: '09:00', close: '23:00' }] },
      sunday: { isOpen: true, slots: [{ open: '10:00', close: '21:00' }] },
    },
  },
  order_rules: {
    min_value: null,
    estimated_prep_time: 15,
    allow_special_instructions: true,
    session_timeout_minutes: 120,
    require_guest_count: false,
  },
  payment: {
    payos_client_id: null,
    payos_api_key: null,
    payos_checksum_key: null,
  },
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    key: 'restaurant',
    title: 'Thông tin nhà hàng',
    description: 'Tên, địa chỉ và hình ảnh',
    icon: 'Store',
    required: true,
    canSkip: false,
  },
  {
    id: 2,
    key: 'locale',
    title: 'Định dạng & Ngôn ngữ',
    description: 'Tiền tệ, múi giờ, ngôn ngữ',
    icon: 'Globe',
    required: true,
    canSkip: false,
  },
  {
    id: 3,
    key: 'tax_charge',
    title: 'Thuế & Phí dịch vụ',
    description: 'Cấu hình VAT và phí phục vụ',
    icon: 'Receipt',
    required: false,
    canSkip: true,
  },
  {
    id: 4,
    key: 'hours',
    title: 'Giờ hoạt động',
    description: 'Lịch mở cửa theo ngày',
    icon: 'Clock',
    required: false,
    canSkip: true,
  },
  {
    id: 5,
    key: 'order_rules',
    title: 'Quy tắc đặt hàng',
    description: 'Thời gian, giá trị tối thiểu',
    icon: 'ClipboardList',
    required: false,
    canSkip: true,
  },
  {
    id: 6,
    key: 'payment',
    title: 'Thanh toán QR',
    description: 'Cấu hình PayOS API',
    icon: 'QrCode',
    required: false,
    canSkip: true,
  },
  {
    id: 7,
    key: 'review',
    title: 'Xác nhận',
    description: 'Kiểm tra và hoàn tất',
    icon: 'CheckCircle',
    required: true,
    canSkip: false,
  },
]
