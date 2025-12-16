import { ContactHeader } from "@/components/contact/contact-header"
import { ContactContent } from "@/components/contact/contact-content"
import { Footer } from "@/components/landing/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Liên hệ - Đăng ký dùng thử Qrenso | Đặt lịch demo miễn phí",
  description:
    "Đăng ký dùng thử Qrenso hoặc đặt lịch demo 15 phút với đội ngũ tư vấn. Nhận tư vấn miễn phí về giải pháp quản lý nhà hàng phù hợp.",
  openGraph: {
    title: "Liên hệ Qrenso - Đặt lịch demo miễn phí",
    description: "Đăng ký dùng thử hoặc đặt lịch demo 15 phút để trải nghiệm Qrenso",
    type: "website",
    locale: "vi_VN",
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <ContactHeader />
      <main>
        <ContactContent />
      </main>
      <Footer />
    </div>
  )
}
