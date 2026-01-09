'use client'

import { Suspense, use } from 'react'
import { useOrderQuery } from '@/src/features/admin/orders/queries'
import { useOrdersSocket } from '@/src/features/admin/orders/hooks'
import { OrderSummaryHeader } from '@/src/features/admin/orders/components/order-summary-header'
import { OrderItemsList } from '@/src/features/admin/orders/components/order-items-list'
import { OrderNotes } from '@/src/features/admin/orders/components/order-notes'
import { OrderStatusTimeline } from '@/src/features/admin/orders/components/order-status-timeline'
import { PaymentCard } from '@/src/features/admin/orders/components/payment-card'
import { Loader2 } from 'lucide-react'
import { useCurrentTenantQuery } from '@/src/features/admin/tenants/queries/tenants.queries'
import { useTranslations } from 'next-intl'

function LoadingState() {
  const t = useTranslations('orders')
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      <span className="ml-3 text-slate-600 dark:text-slate-400">
        {t('page.loadingOrder')}
      </span>
    </div>
  )
}

function ErrorState() {
  const t = useTranslations('orders')
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-500/10">
      <h2 className="text-lg font-semibold text-red-900 dark:text-red-400">
        {t('page.notFound')}
      </h2>
      <p className="mt-2 text-sm text-red-700 dark:text-red-300">
        {t('page.notFoundDesc')}
      </p>
    </div>
  )
}

function OrderDetailContent({ orderId }: { orderId: string }) {
  const { data, isLoading, error } = useOrderQuery(orderId)
  const order = data?.data
  const { data: tenantData } = useCurrentTenantQuery()

  // Enable socket for real-time updates from KDS
  useOrdersSocket({ enabled: true, showNotifications: true })

  if (isLoading) {
    return <LoadingState />
  }

  if (error || !order) {
    return <ErrorState />
  }

  return (
    <div className="space-y-6">
      {/* Order Summary Header */}
      <OrderSummaryHeader order={order} />

      {/* Main Layout: Two Columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Items + Notes */}
        <div className="space-y-6 lg:col-span-2">
          <OrderItemsList items={order.items} orderId={order.id} />
          <OrderNotes
            specialInstructions={order.specialInstructions}
            rejectionReason={order.rejectionReason}
          />
        </div>

        {/* Right: Payment + Timeline */}
        <div className="space-y-6">
          <PaymentCard
            payments={order.payments}
            totalAmount={order.totalAmount}
            order={order}
            tenantName={tenantData?.data?.name}
            tenantAddress={tenantData?.data?.address}
          />
          <OrderStatusTimeline history={order.statusHistory} />
        </div>
      </div>
    </div>
  )
}

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  // Next.js 15+: params is a Promise, use React.use() to unwrap
  const { orderId } = use(params)

  return (
    <Suspense fallback={<LoadingState />}>
      <OrderDetailContent orderId={orderId} />
    </Suspense>
  )
}
