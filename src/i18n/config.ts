export const locales = ['vi', 'en', 'zh', 'fr'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'vi'
export const localeNames: Record<Locale, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
  zh: '中文',
  fr: 'Français',
}