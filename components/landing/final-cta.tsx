import { Button } from '@/components/ui/button'
import { ArrowRight, MessageCircle } from 'lucide-react'

export function FinalCTA() {
  return (
    <section className="border-b border-slate-800/50 bg-gradient-to-b from-slate-900/50 to-slate-950 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Headline */}
          <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Sẵn sàng số hoá nhà hàng của bạn?
          </h2>
          <p className="mt-6 text-lg text-slate-300 md:text-xl">
            Hơn 500+ nhà hàng đã tăng tốc phục vụ và giảm sai sót với Qrenso. Bắt đầu ngay hôm nay!
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-12 gap-2 bg-emerald-600 px-8 text-base hover:bg-emerald-700"
            >
              Đặt lịch demo miễn phí
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 gap-2 border-slate-700 bg-transparent px-8 text-base text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Liên hệ tư vấn
            </Button>
          </div>

          {/* Trust badge */}
          <p className="mt-8 text-sm text-slate-400">
            Dùng thử 14 ngày miễn phí • Không yêu cầu thẻ tín dụng • Hỗ trợ 24/7
          </p>
        </div>
      </div>
    </section>
  )
}
