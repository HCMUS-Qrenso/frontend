'use client'

import { Suspense } from 'react'
import { OrderSummaryHeader } from '@/src/features/admin/orders/components/order-summary-header'
import { OrderItemsList } from '@/src/features/admin/orders/components/order-items-list'
import { OrderNotes } from '@/src/features/admin/orders/components/order-notes'
import { OrderStatusTimeline } from '@/src/features/admin/orders/components/order-status-timeline'
import { PaymentCard } from '@/src/features/admin/orders/components/payment-card'

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

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
  return (
    <Suspense fallback={null}>
      <OrderDetailContent orderId={params.orderId} />
    </Suspense>
  )
}

