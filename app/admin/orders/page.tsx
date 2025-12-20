"use client"

import { Suspense } from "react"
import { OrdersOverviewStats } from "@/components/admin/orders-overview-stats"
import { OrdersFilterToolbar } from "@/components/admin/orders-filter-toolbar"
import { OrdersTable } from "@/components/admin/orders-table"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

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

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrdersContent />
    </Suspense>
  )
}
