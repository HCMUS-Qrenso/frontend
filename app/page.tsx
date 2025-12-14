import { Header } from '@/components/landing/header'
import { Hero } from '@/components/landing/hero'
import { ProductShowcase } from '@/components/landing/product-showcase'
import { FeatureGrid } from '@/components/landing/feature-grid'
import { HowItWorks } from '@/components/landing/how-it-works'
import { BuiltForRoles } from '@/components/landing/built-for-roles'
import { Testimonials } from '@/components/landing/testimonials'
import { Pricing } from '@/components/landing/pricing'
import { FAQ } from '@/components/landing/faq'
import { FinalCTA } from '@/components/landing/final-cta'
import { Footer } from '@/components/landing/footer'
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
    <div className="min-h-screen bg-slate-950">
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
