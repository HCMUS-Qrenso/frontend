import { QrCode, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import type { TableQR } from "./qr-manager-content"

interface QRManagerStatsProps {
  tables: TableQR[]
}

export function QRManagerStats({ tables }: QRManagerStatsProps) {
  const totalTables = tables.length
  const tablesWithQR = tables.filter((t) => t.status === "Ready").length
  const missingQR = tables.filter((t) => t.status === "Missing").length
  const lastRegenerated = "15/01/2024 14:30"

  const stats = [
    {
      icon: QrCode,
      label: "Total Tables",
      value: totalTables,
      color: "text-slate-600 dark:text-slate-400",
      bgColor: "bg-slate-50 dark:bg-slate-800",
    },
    {
      icon: CheckCircle2,
      label: "Tables with QR",
      value: tablesWithQR,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      icon: AlertCircle,
      label: "Missing QR",
      value: missingQR,
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-500/10",
    },
    {
      icon: Clock,
      label: "Last Regenerated",
      value: lastRegenerated,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-500/10",
      isDate: true,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {stat.label}
            </span>
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </div>
          <div className={`${stat.isDate ? "text-lg" : "text-2xl"} font-semibold text-slate-900 dark:text-white`}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  )
}
