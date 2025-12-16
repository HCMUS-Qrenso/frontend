import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: "1.990.000",
    period: "tháng",
    description: "Phù hợp cho quán nhỏ, mới bắt đầu",
    features: [
      "1 chi nhánh",
      "Tối đa 20 bàn",
      "QR Ordering cơ bản",
      "Dashboard & KDS",
      "Báo cáo cơ bản",
      "Hỗ trợ email",
    ],
    cta: "Bắt đầu dùng thử",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "3.990.000",
    period: "tháng",
    description: "Cho nhà hàng vừa & lớn",
    features: [
      "Tối đa 3 chi nhánh",
      "Không giới hạn bàn",
      "QR Ordering đầy đủ",
      "Dashboard & KDS realtime",
      "Analytics nâng cao",
      "Payment gateway",
      "Multi-language",
      "Hỗ trợ ưu tiên 24/7",
    ],
    cta: "Đặt lịch demo",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Liên hệ",
    period: "",
    description: "Giải pháp cho chuỗi nhà hàng",
    features: [
      "Không giới hạn chi nhánh",
      "Không giới hạn bàn",
      "Tất cả tính năng Pro",
      "Tùy chỉnh theo yêu cầu",
      "API riêng",
      "Đào tạo on-site",
      "Account manager riêng",
    ],
    cta: "Liên hệ tư vấn",
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="border-b border-slate-200 bg-slate-50 py-20 dark:border-slate-800/50 dark:bg-slate-900/50 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">Bảng giá minh bạch</h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">Chọn gói phù hợp với quy mô nhà hàng của bạn</p>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl border p-8 ${
                  plan.highlighted
                    ? "border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/20"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50"
                }`}
              >
                {/* Plan Name */}
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{plan.description}</p>

                {/* Price */}
                <div className="mt-6">
                  {plan.period ? (
                    <>
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}₫</span>
                      <span className="text-slate-500 dark:text-slate-400">/{plan.period}</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                  )}
                </div>

                {/* CTA */}
                <Button
                  className={`mt-8 w-full ${
                    plan.highlighted
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"
                  }`}
                >
                  {plan.cta}
                </Button>

                {/* Features */}
                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Note */}
          <p className="mt-12 text-center text-sm text-slate-500 dark:text-slate-400">
            Tất cả gói đều có 14 ngày dùng thử miễn phí. Không yêu cầu thẻ tín dụng.
          </p>
        </div>
      </div>
    </section>
  )
}
