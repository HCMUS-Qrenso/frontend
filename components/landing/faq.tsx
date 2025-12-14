"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    question: "Setup QR ordering mất bao lâu?",
    answer:
      "Trung bình 2-3 giờ. Bạn chỉ cần thêm menu, tạo bàn và QR code. Chúng tôi có hướng dẫn chi tiết và video tutorial.",
  },
  {
    question: "Có phí giao dịch thanh toán không?",
    answer:
      "Phí gateway do đối tác thanh toán (VNPay, MoMo, ZaloPay) quy định, thường 1-3%. Qrenso không thu thêm phí.",
  },
  {
    question: "Chạy trên thiết bị nào?",
    answer:
      "Qrenso là web app, chạy trên mọi thiết bị có trình duyệt: laptop, tablet, điện thoại. KDS nên dùng tablet hoặc màn hình lớn.",
  },
  {
    question: "Có hỗ trợ nhiều chi nhánh không?",
    answer: "Có. Gói Pro hỗ trợ tối đa 3 chi nhánh, gói Enterprise không giới hạn. Mỗi chi nhánh có dashboard riêng.",
  },
  {
    question: "Làm sao import menu nhanh?",
    answer: "Bạn có thể import từ file Excel theo template có sẵn. Hoặc nhập thủ công nhanh qua form đơn giản.",
  },
  {
    question: "Dữ liệu có an toàn không?",
    answer: "Dữ liệu được mã hoá và backup tự động hàng ngày. Chúng tôi tuân thủ chuẩn bảo mật quốc tế ISO 27001.",
  },
  {
    question: "Có hỗ trợ khi gặp sự cố không?",
    answer: "Gói Starter có hỗ trợ email, gói Pro có hỗ trợ 24/7 qua chat/phone. Enterprise có account manager riêng.",
  },
  {
    question: "Có thể hủy bất cứ lúc nào không?",
    answer: "Có. Không cam kết dài hạn. Bạn có thể hủy bất cứ lúc nào, dữ liệu được giữ 30 ngày để export.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="border-b border-slate-800/50 bg-slate-950 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Section Header */}
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">Câu hỏi thường gặp</h2>
            <p className="mt-4 text-lg text-slate-400">Giải đáp các thắc mắc phổ biến về Qrenso</p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                <button
                  className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-slate-900"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="pr-8 font-semibold text-white">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 flex-shrink-0 text-slate-400 transition-transform",
                      openIndex === index && "rotate-180",
                    )}
                  />
                </button>
                {openIndex === index && (
                  <div className="border-t border-slate-800 px-6 py-4">
                    <p className="text-slate-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
