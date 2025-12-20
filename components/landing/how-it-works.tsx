import { CheckCircle2 } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Setup menu & bàn',
    description: 'Tạo menu món ăn, categories, giá. Thiết lập bàn và tạo QR code.',
  },
  {
    number: '02',
    title: 'Khách scan QR',
    description: 'Khách quét QR trên bàn, xem menu và order trực tiếp trên điện thoại.',
  },
  {
    number: '03',
    title: 'Bếp & Waiter nhận realtime',
    description: 'Order hiển thị ngay trên KDS bếp và dashboard waiter. Xử lý tức thì.',
  },
  {
    number: '04',
    title: 'Phục vụ & Thanh toán',
    description: 'Phục vụ món ăn theo thứ tự. Khách thanh toán sau bữa ăn, linh hoạt.',
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-b border-slate-200 bg-white py-20 md:py-32 dark:border-slate-800/50 dark:bg-slate-950"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">
              Cách hoạt động đơn giản
            </h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              4 bước để số hoá nhà hàng của bạn
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="group relative flex gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all hover:border-emerald-500/50 hover:scale-105 hover:outline-2 hover:outline-emerald-500/30 dark:border-slate-800 dark:bg-slate-900/50"
              >
                {/* Number */}
                <div className="flex-shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl font-bold text-emerald-400">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">{step.description}</p>
                </div>

                {/* Check icon */}
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
