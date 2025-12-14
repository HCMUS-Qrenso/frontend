import type React from 'react'
import { UtensilsCrossed, CheckCircle2 } from 'lucide-react'

interface AuthContainerProps {
  children: React.ReactNode
}

export function AuthContainer({ children }: AuthContainerProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-6xl gap-0 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-2xl lg:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
        {/* Left Panel - Brand Info (Hidden on mobile) */}
        <div className="hidden bg-gradient-to-br from-emerald-600 to-emerald-700 p-12 lg:flex lg:flex-col lg:justify-between">
          {/* Logo & Brand */}
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <UtensilsCrossed className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Qrenso</h1>
                <p className="text-sm text-emerald-50">QR Menu & Dine-in Ordering</p>
              </div>
            </div>

            <h2 className="mb-4 text-3xl leading-tight font-bold text-white lg:text-4xl">
              Quản lý nhà hàng thông minh, mọi lúc mọi nơi
            </h2>
            <p className="mb-8 text-base leading-relaxed text-emerald-50 lg:text-lg">
              Hệ thống quản lý toàn diện giúp bạn kiểm soát mọi hoạt động của nhà hàng, từ đơn hàng,
              menu, đến nhân viên và báo cáo doanh thu.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {[
                'Theo dõi order real-time từ khách hàng',
                'QR menu tự động cho từng bàn',
                'Dashboard doanh thu và hiệu suất chi tiết',
                'Kitchen Display System (KDS) thông minh',
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-white" />
                  <p className="text-sm font-medium text-white">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative Element */}
          <div className="mt-8 rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-sm text-emerald-50 italic">
              "Qrenso giúp chúng tôi tăng 40% hiệu suất phục vụ và giảm thiểu sai sót trong order."
            </p>
            <p className="mt-2 text-xs font-semibold text-white">Nhà hàng Phố Cổ - Hà Nội</p>
          </div>
        </div>

        {/* Right Panel - Form Content */}
        <div className="flex flex-col justify-center px-8 py-10 lg:px-12 lg:py-16">{children}</div>
      </div>
    </div>
  )
}
