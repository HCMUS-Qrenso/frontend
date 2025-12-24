'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/src/lib/utils'
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

const tableImages = [
  { src: '/Table-List.png', label: 'Danh sách bàn' },
  { src: '/Table-Canvas.png', label: 'Sơ đồ mặt bằng' },
  { src: '/Table-QR.png', label: 'Quản lý QR' },
]

const dashboardImages = [
  { src: '/Dashboard-1.png', label: 'Dashboard Overview' },
  { src: '/Dashboard-2.png', label: 'Dashboard Analytics' },
]

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState('dashboard')

  // Slideshow state for tables tab
  const [currentIndex, setCurrentIndex] = useState(0)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  // Slideshow state for dashboard tab
  const [dashboardIndex, setDashboardIndex] = useState(0)
  const dashboardAutoPlayRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-play logic for tables tab
  useEffect(() => {
    // Only auto-play for tables tab
    if (activeTab !== 'tables') {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
      return
    }

    // Reset to first slide when switching to tables tab
    setCurrentIndex(0)

    // Clear existing interval
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }

    // Set up auto-play (7 seconds)
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tableImages.length)
    }, 7000)

    // Cleanup
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [activeTab])

  // Auto-play logic for dashboard tab
  useEffect(() => {
    // Only auto-play for dashboard tab
    if (activeTab !== 'dashboard') {
      if (dashboardAutoPlayRef.current) {
        clearInterval(dashboardAutoPlayRef.current)
      }
      return
    }

    // Reset to first slide when switching to dashboard tab
    setDashboardIndex(0)

    // Clear existing interval
    if (dashboardAutoPlayRef.current) {
      clearInterval(dashboardAutoPlayRef.current)
    }

    // Set up auto-play (7 seconds)
    dashboardAutoPlayRef.current = setInterval(() => {
      setDashboardIndex((prev) => (prev + 1) % dashboardImages.length)
    }, 7000)

    // Cleanup
    return () => {
      if (dashboardAutoPlayRef.current) {
        clearInterval(dashboardAutoPlayRef.current)
      }
    }
  }, [activeTab])

  // Handle tab change - reset slideshow
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    if (tabId !== 'tables') {
      setCurrentIndex(0)
    }
    if (tabId !== 'dashboard') {
      setDashboardIndex(0)
    }
  }

  // Go to specific slide for tables
  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    // Reset auto-play timer
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
    if (activeTab === 'tables') {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % tableImages.length)
      }, 7000)
    }
  }

  // Go to specific slide for dashboard
  const goToDashboardSlide = (index: number) => {
    setDashboardIndex(index)
    // Reset auto-play timer
    if (dashboardAutoPlayRef.current) {
      clearInterval(dashboardAutoPlayRef.current)
    }
    if (activeTab === 'dashboard') {
      dashboardAutoPlayRef.current = setInterval(() => {
        setDashboardIndex((prev) => (prev + 1) % dashboardImages.length)
      }, 7000)
    }
  }

  return (
    <section className="border-b border-slate-200 bg-white py-20 md:py-32 dark:border-slate-800/50 dark:bg-slate-950">
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
                onClick={() => handleTabChange(tab.id)}
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
            <p className="text-slate-600 dark:text-slate-300">
              {tabs.find((t) => t.id === activeTab)?.description}
            </p>
          </div>

          {/* Screenshot */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            {activeTab === 'tables' ? (
              <>
                {/* Slideshow Container */}
                <div className="relative overflow-hidden rounded-lg">
                  {/* Slides Wrapper */}
                  <div
                    className="flex aspect-video transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                  >
                    {tableImages.map((image, index) => (
                      <div
                        key={index}
                        className="flex min-w-full shrink-0 items-center justify-center"
                      >
                        <img
                          src={image.src}
                          alt={image.label}
                          className="h-full w-full rounded-lg object-contain"
                          draggable={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Dots */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  {tableImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        currentIndex === index
                          ? 'w-8 bg-emerald-500'
                          : 'w-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500',
                      )}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            ) : activeTab === 'dashboard' ? (
              <>
                {/* Slideshow Container */}
                <div className="relative overflow-hidden rounded-lg">
                  {/* Slides Wrapper */}
                  <div
                    className="flex aspect-video transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${dashboardIndex * 100}%)` }}
                  >
                    {dashboardImages.map((image, index) => (
                      <div
                        key={index}
                        className="flex min-w-full shrink-0 items-center justify-center"
                      >
                        <img
                          src={image.src}
                          alt={image.label}
                          className="h-full w-full rounded-lg object-contain"
                          draggable={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Dots */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  {dashboardImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToDashboardSlide(index)}
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        dashboardIndex === index
                          ? 'w-8 bg-emerald-500'
                          : 'w-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500',
                      )}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900">
                {(() => {
                  const activeTabData = tabs.find((t) => t.id === activeTab)
                  const Icon = activeTabData?.icon || LayoutDashboard
                  return (
                    <div className="text-center">
                      <Icon className="mx-auto mb-4 h-16 w-16 text-emerald-500/50" />
                      <p className="text-sm text-slate-500 dark:text-slate-500">
                        {activeTabData?.label} Screenshot
                      </p>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-600">
                        Screenshot sẽ được thay thế sau
                      </p>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
