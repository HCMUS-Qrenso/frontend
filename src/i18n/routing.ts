import { defineRouting } from 'next-intl/routing'
import { locales, defaultLocale } from './config'
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // Ẩn prefix cho default locale (vi)
})
