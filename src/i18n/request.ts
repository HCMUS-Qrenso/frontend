import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  // Validate locale
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }
  
  // Use namespace aggregator files for all locales (en, vi, fr, zh)
  let messages;
  switch (locale) {
    case 'en':
      messages = (await import('../locales/en')).default;
      break;
    case 'vi':
      messages = (await import('../locales/vi')).default;
      break;
    case 'fr':
      messages = (await import('../locales/fr')).default;
      break;
    case 'zh':
      messages = (await import('../locales/zh')).default;
      break;
    default:
      messages = (await import('../locales/en')).default;
  }
  
  return {
    locale,
    messages,
  }
})
