import { QrCode, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import type { TableQR } from '@/src/features/admin/tables/types/tables'
import { StatCard } from '../../../../../components/ui/stat-card'
import { SkeletonStatCard } from '@/src/components/loading'

interface QRManagerStatsProps {
  total_active_tables?: number
  tables_with_qr?: number
  tables_without_qr?: number
  latest_qr_update?: string | null
  isLoading?: boolean
}

export function QRManagerStats({
  total_active_tables,
  tables_with_qr,
  tables_without_qr,
  latest_qr_update,
  isLoading = false,
}: QRManagerStatsProps) {
  if (isLoading) {
    return <SkeletonStatCard count={4} columns={4} />
  }
  const latestQrUpdateFormatted = latest_qr_update
    ? new Date(latest_qr_update).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  console.log('QRManagerStats render with:', {
    total_active_tables,
    tables_with_qr,
    tables_without_qr,
    latest_qr_update,
  })

  const stats = [
    {
      icon: QrCode,
      label: 'Tổng số bàn',
      value: total_active_tables?.toString() ?? '—',
      subtext: 'Tổng cộng',
      color: 'text-slate-600 dark:text-slate-400',
      bgColor: 'bg-slate-50 dark:bg-slate-800',
    },
    {
      icon: CheckCircle2,
      label: 'Bàn có QR',
      value: tables_with_qr?.toString() ?? '—',
      subtext: 'Đã có QR code',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      icon: AlertCircle,
      label: 'Thiếu QR',
      value: tables_without_qr?.toString() ?? '—',
      subtext: 'Chưa có QR code',
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-500/10',
    },
    {
      icon: Clock,
      label: 'Lần tạo lại cuối',
      value: latestQrUpdateFormatted,
      subtext: 'Cập nhật gần nhất',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          title={stat.label}
          value={stat.value}
          subtext={stat.subtext}
          icon={stat.icon}
          iconColor={stat.color}
          iconBgColor={stat.bgColor}
          valueSz={stat.label === 'Lần tạo lại cuối' ? 'text-lg' : 'text-2xl'}
        />
      ))}
    </div>
  )
}
