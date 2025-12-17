'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Crown, ChefHat, UserCheck, Calculator } from 'lucide-react'

const roles = [
  {
    id: 'owner',
    icon: Crown,
    label: 'Chủ nhà hàng',
    painPoints: [
      'Khó theo dõi doanh thu realtime',
      'Sai sót order gây phàn nàn',
      'Khó quản lý nhiều bàn cùng lúc',
    ],
    solutions: [
      'Dashboard tổng quan toàn diện',
      'Analytics chi tiết theo thời gian',
      'Báo cáo tự động, export dễ dàng',
    ],
  },
  {
    id: 'cashier',
    icon: Calculator,
    label: 'Thu ngân',
    painPoints: [
      'Order viết tay dễ sai sót',
      'Tính tiền lâu, khách chờ lâu',
      'Khó đối chiếu cuối ca',
    ],
    solutions: ['Order tự động từ khách', 'Tính tiền tức thì, chính xác', 'Report cuối ca tự động'],
  },
  {
    id: 'waiter',
    icon: UserCheck,
    label: 'Phục vụ',
    painPoints: [
      'Chạy qua lại ghi order',
      'Khách gọi nhiều, không kịp',
      'Quên order, bàn nào order gì',
    ],
    solutions: [
      'Khách tự order qua QR',
      'Nhận thông báo order mới realtime',
      'Xem lịch sử order từng bàn',
    ],
  },
  {
    id: 'chef',
    icon: ChefHat,
    label: 'Bếp',
    painPoints: [
      'Order viết tay khó đọc',
      'Không biết ưu tiên món nào',
      'Bỏ sót order khi quá tải',
    ],
    solutions: ['KDS hiển thị rõ ràng', 'Sắp xếp ưu tiên tự động', 'Countdown thời gian chế biến'],
  },
]

export function BuiltForRoles() {
  const [activeRole, setActiveRole] = useState('owner')
  const currentRole = roles.find((r) => r.id === activeRole)!

  return (
    <section className="border-b border-slate-200 bg-slate-50 py-20 md:py-32 dark:border-slate-800/50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">
              Được thiết kế cho từng vai trò
            </h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              Giải quyết đúng vấn đề của từng người trong nhà hàng
            </p>
          </div>

          {/* Role Tabs */}
          <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={cn(
                  'flex flex-col items-center gap-3 rounded-2xl border p-6 transition-all',
                  activeRole === role.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-300 bg-white hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700',
                )}
              >
                <div
                  className={cn(
                    'rounded-xl p-3',
                    activeRole === role.id ? 'bg-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800',
                  )}
                >
                  <role.icon
                    className={cn(
                      'h-6 w-6',
                      activeRole === role.id
                        ? 'text-emerald-400'
                        : 'text-slate-600 dark:text-slate-400',
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'text-sm font-medium',
                    activeRole === role.id
                      ? 'text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400',
                  )}
                >
                  {role.label}
                </span>
              </button>
            ))}
          </div>

          {/* Pain Points & Solutions */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Pain Points */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900/50">
              <h3 className="mb-6 text-xl font-semibold text-slate-900 dark:text-white">
                Vấn đề thường gặp
              </h3>
              <ul className="space-y-4">
                {currentRole.painPoints.map((pain, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                    <span className="text-slate-600 dark:text-slate-300">{pain}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solutions */}
            <div className="rounded-2xl border border-emerald-500/50 bg-emerald-500/5 p-8">
              <h3 className="mb-6 text-xl font-semibold text-slate-900 dark:text-white">
                Qrenso giải quyết
              </h3>
              <ul className="space-y-4">
                {currentRole.solutions.map((solution, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
                    <span className="text-slate-600 dark:text-slate-300">{solution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
