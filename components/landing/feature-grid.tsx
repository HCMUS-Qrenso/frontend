import { BarChart3, CreditCard, Globe, Laptop, QrCode, Shield, Smartphone, Zap } from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Dashboard vận hành",
    description: "Theo dõi orders, doanh thu, bàn trống realtime. Analytics chi tiết theo ngày/tuần/tháng.",
  },
  {
    icon: QrCode,
    title: "Tables & QR Manager",
    description: "Tạo QR cho từng bàn, quản lý sơ đồ mặt bằng, theo dõi trạng thái bàn trực quan.",
  },
  {
    icon: Laptop,
    title: "KDS Realtime",
    description: "Màn hình bếp nhận order tức thì, sắp xếp ưu tiên, không bỏ sót món.",
  },
  {
    icon: Smartphone,
    title: "Customer Ordering",
    description: "Khách scan QR và order ngay trên điện thoại, xem menu đầy đủ, gọi món dễ dàng.",
  },
  {
    icon: CreditCard,
    title: "Payment linh hoạt",
    description: "Tích hợp VNPay, MoMo, ZaloPay, Stripe. Thanh toán sau bữa ăn hoặc online.",
  },
  {
    icon: Zap,
    title: "Analytics & Reports",
    description: "Báo cáo doanh thu, món bán chạy, hiệu suất phục vụ. Export Excel/PDF.",
  },
  {
    icon: Shield,
    title: "Roles & Permissions",
    description: "Phân quyền chi tiết: Admin, Thu ngân, Waiter, Bếp. Bảo mật đa cấp.",
  },
  {
    icon: Globe,
    title: "Multi-language & Branch",
    description: "Hỗ trợ đa ngôn ngữ, quản lý nhiều chi nhánh trên một tài khoản.",
  },
]

export function FeatureGrid() {
  return (
    <section id="features" className="border-b border-slate-200 bg-slate-50 py-20 dark:border-slate-800/50 dark:bg-slate-900/50 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">Tính năng hoàn chỉnh cho nhà hàng hiện đại</h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">Từ đặt món đến thanh toán, từ bếp đến quản lý</p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-500/50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900"
              >
                <div className="mb-4 inline-flex rounded-xl bg-emerald-500/10 p-3">
                  <feature.icon className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
