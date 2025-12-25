import { Suspense } from 'react'
import { TodayStats } from '@/src/features/admin/dashboard/components/today-stats'
import { PerformanceChart } from '@/src/features/admin/dashboard/components/performance-chart'
import { RecentOrders } from '@/src/features/admin/dashboard/components/recent-orders'
import { TopItems } from '@/src/features/admin/dashboard/components/top-items'

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="space-y-6">
        {/* KPI Cards */}
        <TodayStats />

        {/* Performance Chart */}
        <PerformanceChart />

        {/* Recent Orders + Top Items */}
        <div className="grid gap-6 lg:grid-cols-3">
          <RecentOrders className="lg:col-span-2" />
          <TopItems className="lg:col-span-1" />
        </div>
      </div>
    </Suspense>
  )
}
