import { ContactContent } from '@/src/features/landing/components/contact/contact-content'
import { Footer } from '@/src/features/landing/components/contact/footer'
import type { Metadata } from 'next'
import { Header } from '@/src/features/landing/components/contact/header'

export const metadata: Metadata = {
  title: 'Liên hệ - Đăng ký dùng thử Qrenso | Đặt lịch demo miễn phí',
  description:
    'Đăng ký dùng thử Qrenso hoặc đặt lịch demo 15 phút với đội ngũ tư vấn. Nhận tư vấn miễn phí về giải pháp quản lý nhà hàng phù hợp.',
  openGraph: {
    title: 'Liên hệ Qrenso - Đặt lịch demo miễn phí',
    description: 'Đăng ký dùng thử hoặc đặt lịch demo 15 phút để trải nghiệm Qrenso',
    type: 'website',
    locale: 'vi_VN',
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header />
      <main>
        <ContactContent />
      </main>
      <Footer />
    </div>
  )
}
