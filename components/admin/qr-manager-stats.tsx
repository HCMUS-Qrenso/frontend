import { QrCode, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import type { TableQR } from '@/types/tables'

interface QRManagerStatsProps {
  total_active_tables?: number
  tables_with_qr?: number
  tables_without_qr?: number
  latest_qr_update?: string | null
}

export function QRManagerStats({
  total_active_tables,
  tables_with_qr,
  tables_without_qr,
  latest_qr_update,
}: QRManagerStatsProps) {
  const latestQrUpdateFormatted = latest_qr_update
    ? new Date(latest_qr_update).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
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
        <div
          key={stat.label}
          className="flex items-start justify-between rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
        >
          <div>
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{stat.subtext}</p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}>
            <stat.icon className={`h-6 w-6 ${stat.color}`} />
          </div>
        </div>
      ))}
    </div>
  )
}
