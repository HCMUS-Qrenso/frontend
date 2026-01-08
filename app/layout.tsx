import type React from 'react'
import type { Metadata, Viewport } from 'next'
import './[locale]/globals.css'

export const metadata: Metadata = {
  title: 'Qrenso - Admin Dashboard',
  description: 'Hệ thống quản lý nhà hàng thông minh với QR Menu & Dine-in Ordering',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
}

/**
 * Root layout for App Router.
 * This layout does NOT include html/body tags because:
 * 1. The [locale] layout handles html/body with dynamic lang attribute
 * 2. Global not-found.tsx wraps itself with html/body for 404 pages outside locale context
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
