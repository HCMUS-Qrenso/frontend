import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Nguyễn Minh Tuấn',
    role: 'Chủ nhà hàng',
    restaurant: 'Nhà hàng Phố Cổ',
    avatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenMinhTuan&backgroundColor=b6e3f4,c0aede,d1d4f9',
    rating: 5,
    quote:
      'Sau khi dùng Qrenso, doanh thu tăng 30% do phục vụ nhanh hơn. Sai sót order giảm gần như về 0. Rất hài lòng!',
  },
  {
    name: 'Trần Thị Hương',
    role: 'Quản lý',
    restaurant: 'Quán Ăn Ngon',
    avatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=TranThiHuong&backgroundColor=ffd5dc,ffdfbf',
    rating: 5,
    quote:
      'KDS giúp bếp không bỏ sót món nào. Dashboard realtime giúp tôi theo dõi mọi thứ từ xa. Tiện lợi vô cùng!',
  },
  {
    name: 'Lê Hoàng Nam',
    role: 'Chủ chuỗi nhà hàng',
    restaurant: 'Food Chain Co.',
    avatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=LeHoangNam&backgroundColor=c7d2fe,ffd5dc',
    rating: 5,
    quote:
      'Quản lý 5 chi nhánh trên một tài khoản. Báo cáo tổng hợp giúp tôi ra quyết định nhanh. Đáng đầu tư!',
  },
]

export function Testimonials() {
  return (
    <section className="border-b border-slate-200 bg-white py-20 md:py-32 dark:border-slate-800/50 dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">
              Khách hàng nói gì về Qrenso
            </h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              Hàng trăm nhà hàng đã tin dùng và hài lòng
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50"
              >
                {/* Rating */}
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="mb-6 text-slate-600 dark:text-slate-300">{testimonial.quote}</p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {testimonial.role} - {testimonial.restaurant}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
