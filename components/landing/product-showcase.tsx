'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LayoutDashboard, ChefHat, Smartphone, QrCode } from 'lucide-react'

const tabs = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Theo dõi toàn bộ hoạt động nhà hàng realtime',
    icon: LayoutDashboard,
  },
  {
    id: 'kds',
    label: 'KDS Bếp',
    description: 'Màn hình bếp nhận order tức thì, không bỏ sót',
    icon: ChefHat,
  },
  {
    id: 'customer',
    label: 'Customer Order',
    description: 'Khách scan QR và order trực tiếp trên điện thoại',
    icon: Smartphone,
  },
  {
    id: 'tables',
    label: 'Tables & QR',
    description: 'Quản lý bàn, tạo QR code, sơ đồ mặt bằng',
    icon: QrCode,
  },
]

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <section className="border-b border-slate-200 bg-white py-20 dark:border-slate-800/50 dark:bg-slate-950 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">
              Một nền tảng, đầy đủ tính năng
            </h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              Từ order đến thanh toán, mọi thứ đều được kết nối
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex flex-wrap justify-center gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'rounded-xl border px-6 py-3 text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-300 bg-slate-50 text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Description */}
          <div className="mb-8 text-center">
            <p className="text-slate-600 dark:text-slate-300">{tabs.find((t) => t.id === activeTab)?.description}</p>
          </div>

          {/* Screenshot */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900">
              {(() => {
                const activeTabData = tabs.find((t) => t.id === activeTab)
                const Icon = activeTabData?.icon || LayoutDashboard
                return (
                  <div className="text-center">
                    <Icon className="mx-auto mb-4 h-16 w-16 text-emerald-500/50" />
                    <p className="text-sm text-slate-500 dark:text-slate-500">{activeTabData?.label} Screenshot</p>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-600">Screenshot sẽ được thay thế sau</p>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
