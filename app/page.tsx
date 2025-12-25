import { Header } from '@/src/features/landing/components/contact/header'
import { Hero } from '@/src/features/landing/components/contact/hero'
import { ProductShowcase } from '@/src/features/landing/components/contact/product-showcase'
import { FeatureGrid } from '@/src/features/landing/components/contact/feature-grid'
import { HowItWorks } from '@/src/features/landing/components/contact/how-it-works'
import { BuiltForRoles } from '@/src/features/landing/components/contact/built-for-roles'
import { Testimonials } from '@/src/features/landing/components/contact/testimonials'
import { Pricing } from '@/src/features/landing/components/contact/pricing'
import { FAQ } from '@/src/features/landing/components/contact/faq'
import { FinalCTA } from '@/src/features/landing/components/contact/final-cta'
import { Footer } from '@/src/features/landing/components/contact/footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Qrenso - Giải pháp QR Ordering & Quản lý Nhà hàng Toàn diện',
  description:
    'Hệ thống QR ordering, dashboard quản lý, KDS bếp, thanh toán và analytics cho nhà hàng. Tăng tốc phục vụ, giảm sai sót, vận hành realtime.',
  keywords:
    'QR ordering, quản lý nhà hàng, KDS, restaurant POS, dine-in ordering, thanh toán nhà hàng',
  openGraph: {
    title: 'Qrenso - Giải pháp QR Ordering & Quản lý Nhà hàng Toàn diện',
    description:
      'Tăng tốc phục vụ, giảm sai sót, vận hành realtime với hệ thống QR ordering và quản lý nhà hàng toàn diện',
    type: 'website',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qrenso - Giải pháp QR Ordering & Quản lý Nhà hàng Toàn diện',
    description:
      'Tăng tốc phục vụ, giảm sai sót, vận hành realtime với hệ thống QR ordering và quản lý nhà hàng toàn diện',
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header />
      <main>
        <Hero />
        <ProductShowcase />
        <FeatureGrid />
        <HowItWorks />
        <BuiltForRoles />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
