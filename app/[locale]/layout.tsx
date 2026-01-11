import type React from 'react'
import { notFound } from 'next/navigation'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/src/i18n/routing'
import { QueryProvider } from '@/src/providers/query-provider'
import { ThemeProvider } from '@/src/components/theme-provider'
import { Toaster } from '@/src/components/ui/sonner'
import { LocaleSync } from '@/src/components/locale-sync'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  // Validate locale
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  // Get messages for client components
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`font-sans antialiased ${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="theme"
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages} locale={locale}>
            <LocaleSync />
            <QueryProvider>{children}</QueryProvider>
          </NextIntlClientProvider>
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
