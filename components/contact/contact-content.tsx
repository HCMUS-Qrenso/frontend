import { ContactInfo } from './contact-info'
import { ContactFormCard } from './contact-form-card'

export function ContactContent() {
  return (
    <section className="border-b border-slate-200 py-16 md:py-24 dark:border-slate-800">
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-black md:text-5xl dark:text-white">
            Liên hệ với Qrenso
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            Để lại thông tin để đội ngũ Qrenso tư vấn giải pháp phù hợp nhất cho nhà hàng của bạn
          </p>
        </div>

        {/* 2-column layout */}
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: Contact Info */}
          <ContactInfo />

          {/* Right: Form Card */}
          <ContactFormCard />
        </div>
      </div>
    </section>
  )
}
