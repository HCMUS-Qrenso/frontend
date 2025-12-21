import { Button } from '@/components/ui/button'
import { ArrowRight, Play } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-linear-to-b from-slate-50 via-white to-slate-50 dark:border-slate-800/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98120_1px,transparent_1px),linear-gradient(to_bottom,#10b98120_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] bg-[size:4rem_4rem]" />

      <div className="relative container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Headline */}
          <h1 className="text-4xl leading-tight font-bold text-balance text-slate-900 md:text-5xl lg:text-6xl dark:text-white">
            Tăng tốc phục vụ, giảm sai sót với{' '}
            <span className="bg-linear-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              QR Ordering
            </span>{' '}
            và quản lý realtime
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-slate-600 md:text-xl dark:text-slate-300">
            Hệ thống hoàn chỉnh cho nhà hàng: Khách order qua QR, bếp nhận đơn tức thì, dashboard
            quản lý toàn diện, thanh toán linh hoạt.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-12 gap-2 bg-emerald-600 px-8 text-base hover:bg-emerald-700"
            >
              Đặt lịch demo
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 gap-2 border-slate-300 bg-transparent px-8 text-base text-slate-900 dark:border-slate-700 dark:text-white"
            >
              <Play className="h-4 w-4" />
              Xem sản phẩm
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-16">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Được tin dùng bởi các nhà hàng hàng đầu
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex h-12 w-32 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800/50"
                >
                  <span className="text-sm text-slate-500 dark:text-slate-400">Logo {i}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <div className="text-3xl font-bold text-emerald-400">-40%</div>
              <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Thời gian xử lý order
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400">-85%</div>
              <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Sai sót đơn hàng
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400">+60%</div>
              <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Tốc độ phục vụ bàn
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
