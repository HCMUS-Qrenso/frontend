import { Suspense } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { TodayStats } from '@/components/admin/today-stats'
import { PerformanceChart } from '@/components/admin/performance-chart'
import { RecentOrders } from '@/components/admin/recent-orders'
import { TopItems } from '@/components/admin/top-items'

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminLayout>
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
      </AdminLayout>
    </Suspense>
  )
}
