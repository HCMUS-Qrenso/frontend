'use client'

import { Suspense } from 'react'
import { OrdersOverviewStats } from '@/src/features/admin/orders/components/orders-overview-stats'
import { OrdersFilterToolbar } from '@/src/features/admin/orders/components/orders-filter-toolbar'
import { OrdersTable } from '@/src/features/admin/orders/components/orders-table'
import { useSearchParams } from 'next/navigation'

function OrdersContent() {
  const searchParams = useSearchParams()

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <OrdersOverviewStats />

      {/* Filter Toolbar */}
      <OrdersFilterToolbar />

      {/* Orders Table */}
      <OrdersTable />
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={null}>
      <OrdersContent />
    </Suspense>
  )
}
