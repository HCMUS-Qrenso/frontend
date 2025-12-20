"use client"

import { Suspense } from "react"
import { OrderSummaryHeader } from "@/components/admin/order-summary-header"
import { OrderItemsList } from "@/components/admin/order-items-list"
import { OrderNotes } from "@/components/admin/order-notes"
import { OrderStatusTimeline } from "@/components/admin/order-status-timeline"
import { PaymentCard } from "@/components/admin/payment-card"
import { Loader2 } from "lucide-react"

function OrderDetailContent({ orderId }: { orderId: string }) {
  return (
    <div className="space-y-6">
      {/* Order Summary Header */}
      <OrderSummaryHeader orderId={orderId} />

      {/* Main Layout: Two Columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Items + Notes */}
        <div className="space-y-6 lg:col-span-2">
          <OrderItemsList orderId={orderId} />
          <OrderNotes orderId={orderId} />
        </div>

        {/* Right: Payment + Timeline */}
        <div className="space-y-6">
          <PaymentCard orderId={orderId} />
          <OrderStatusTimeline orderId={orderId} />
        </div>
      </div>
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

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrderDetailContent orderId={params.orderId} />
    </Suspense>
  )
}

