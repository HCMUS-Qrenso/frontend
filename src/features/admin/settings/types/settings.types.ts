// Settings Types for Tenant Settings Feature

/**
 * General settings for the tenant
 */
export interface GeneralSettings {
  currency: string
  currency_symbol: string
  timezone: string
  date_format: string
  language: string
  phone: string | null
  contact_email: string | null
}

/**
 * Tax settings
 */
export interface TaxSettings {
  rate: number
  inclusive: boolean
  label: string
}

/**
 * Service charge settings
 */
export interface ServiceChargeSettings {
  enabled: boolean
  rate: number
  taxable: boolean
  min_party: number | null
}

/**
 * Operating hours slot
 */
export interface TimeSlot {
  open: string
  close: string
}

/**
 * Operating hours for a day
 */
export interface DayOperatingHours {
  isOpen: boolean
  slots: TimeSlot[]
}

/**
 * Full operating hours configuration
 */
export interface OperatingHours {
  monday?: DayOperatingHours
  tuesday?: DayOperatingHours
  wednesday?: DayOperatingHours
  thursday?: DayOperatingHours
  friday?: DayOperatingHours
  saturday?: DayOperatingHours
  sunday?: DayOperatingHours
}

/**
 * Order settings
 */
export interface OrderSettings {
  min_value: number | null
  estimated_prep_time: number
  allow_special_instructions: boolean
  session_timeout_minutes: number
  require_guest_count: boolean
}

/**
 * Notification settings
 */
export interface NotificationSettings {
  sound_enabled: boolean
  email_enabled: boolean
  email: string | null
}

/**
 * Receipt settings
 */
export interface ReceiptSettings {
  header: string | null
  footer: string | null
  show_logo: boolean
  invoice_prefix: string
}

/**
 * QR Payment settings
 */
export interface QrPaymentSettings {
  payos_api_key: string | null
  payos_checksum_key: string | null
  payos_client_id: string | null
}

/**
 * Complete tenant settings response from API
 */
export interface TenantSettings {
  id: string
  name: string
  address: string | null
  image: string | null
  general: GeneralSettings
  tax: TaxSettings
  service_charge: ServiceChargeSettings
  operating_hours: OperatingHours | null
  order: OrderSettings
  notifications: NotificationSettings
  receipt: ReceiptSettings
  qr_payment: QrPaymentSettings
}

/**
 * API response wrapper for settings
 */
export interface TenantSettingsResponse {
  success: boolean
  data: TenantSettings
}

/**
 * Update settings payload - all fields optional
 */
export interface UpdateTenantSettingsPayload {
  // General
  currency?: string
  currencySymbol?: string
  timezone?: string
  dateFormat?: string
  language?: string
  phone?: string
  contactEmail?: string

  // Tax
  taxRate?: number
  taxInclusive?: boolean
  taxLabel?: string

  // Service charge
  serviceChargeEnabled?: boolean
  serviceChargeRate?: number
  serviceChargeTaxable?: boolean
  serviceChargeMinParty?: number

  // Operating hours
  operatingHours?: OperatingHours

  // Order settings
  minOrderValue?: number
  estimatedPrepTime?: number
  allowSpecialInstructions?: boolean
  sessionTimeoutMinutes?: number
  requireGuestCount?: boolean

  // Notifications
  notifySoundEnabled?: boolean
  notifyEmailEnabled?: boolean
  notifyEmail?: string

  // Receipt
  receiptHeader?: string
  receiptFooter?: string
  receiptShowLogo?: boolean
  invoicePrefix?: string

  // QR Payment
  qrPayosApiKey?: string
  qrPayosChecksumKey?: string
  qrPayosClientId?: string
}
