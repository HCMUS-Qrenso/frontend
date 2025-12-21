'use client'

import { useEffect } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

// Mock data
const MOCK_ORDER = {
  order_number: 'ORD-1024',
  table_name: 'Bàn 5',
  floor: 'Tầng 1',
  created_at: new Date(),
  items: [
    { name: 'Phở bò', quantity: 2, unit_price: 85000, modifiers_total: 40000, subtotal: 210000 },
    { name: 'Bánh xèo', quantity: 1, unit_price: 45000, modifiers_total: 0, subtotal: 45000 },
    { name: 'Cà phê sữa', quantity: 2, unit_price: 25000, modifiers_total: 0, subtotal: 50000 },
  ],
  subtotal: 285000,
  tax_amount: 28500,
  discount_amount: 0,
  total_amount: 313500,
  payment_status: 'completed',
}

export default function PrintOrderPage({ params }: { params: { orderId: string } }) {
  useEffect(() => {
    // Auto-print when page loads
    window.print()
  }, [])

  const order = MOCK_ORDER

  return (
    <div className="mx-auto max-w-2xl p-8 print:p-0">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">Smart Restaurant</h1>
          <p className="text-sm text-slate-600">Nhà hàng thông minh</p>
          <p className="mt-2 text-xs text-slate-500">123 Nguyễn Huệ, Q1, TP.HCM</p>
          <p className="text-xs text-slate-500">Tel: 028 1234 5678</p>
        </div>

        {/* Order Info */}
        <div className="border-y border-slate-200 py-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Đơn:</span> {order.order_number}
            </div>
            <div>
              <span className="font-medium">Bàn:</span> {order.table_name} ({order.floor})
            </div>
            <div className="col-span-2">
              <span className="font-medium">Ngày:</span>{' '}
              {format(order.created_at, 'HH:mm, dd/MM/yyyy', { locale: vi })}
            </div>
          </div>
        </div>

        {/* Items */}
        <div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-300">
                <th className="py-2 text-left">Món</th>
                <th className="py-2 text-center">SL</th>
                <th className="py-2 text-right">Đơn giá</th>
                <th className="py-2 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-200">
                  <td className="py-2">{item.name}</td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right">{item.unit_price.toLocaleString('vi-VN')}₫</td>
                  <td className="py-2 text-right">{item.subtotal.toLocaleString('vi-VN')}₫</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="space-y-2 border-t border-slate-300 pt-4">
          <div className="flex justify-between text-sm">
            <span>Tạm tính:</span>
            <span>{order.subtotal.toLocaleString('vi-VN')}₫</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Thuế (10%):</span>
            <span>{order.tax_amount.toLocaleString('vi-VN')}₫</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              <span>Giảm giá:</span>
              <span>-{order.discount_amount.toLocaleString('vi-VN')}₫</span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-300 pt-2 text-lg font-bold">
            <span>Tổng cộng:</span>
            <span>{order.total_amount.toLocaleString('vi-VN')}₫</span>
          </div>
        </div>

        {/* Payment Status */}
        <div className="text-center">
          <p className="text-sm font-medium">
            Trạng thái: <span className="text-emerald-600">Đã thanh toán</span>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500">
          <p>Cảm ơn quý khách!</p>
          <p>Hẹn gặp lại!</p>
        </div>
      </div>
    </div>
  )
}
