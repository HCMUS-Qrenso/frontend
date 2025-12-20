import { Check, Clock, Mail, MapPin, Phone } from 'lucide-react'

export function ContactInfo() {
  const benefits = [
    'Demo trực tiếp hệ thống trong 15 phút',
    'Tư vấn miễn phí về quy trình vận hành',
    'Báo giá chi tiết cho nhà hàng của bạn',
    'Hỗ trợ triển khai và đào tạo nhân viên',
  ]

  const contactMethods = [
    {
      icon: Phone,
      label: 'Hotline',
      value: '1900 xxxx',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'hello@qrenso.vn',
    },
    {
      icon: MapPin,
      label: 'Văn phòng',
      value: 'TP. Hồ Chí Minh, Việt Nam',
    },
    {
      icon: Clock,
      label: 'Giờ làm việc',
      value: 'T2 - T6: 8h30 - 18h00',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Benefits Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
        <h2 className="mb-6 text-2xl font-bold text-white">Bạn sẽ nhận được gì?</h2>
        <ul className="space-y-4">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <span className="text-slate-300">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Contact Methods */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
        <h2 className="mb-6 text-2xl font-bold text-white">Thông tin liên hệ</h2>
        <div className="space-y-5">
          {contactMethods.map((method, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                <method.icon className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-sm text-slate-400">{method.label}</div>
                <div className="font-medium text-white">{method.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
