"use client"

import { ClipboardList, Clock, ChefHat, CheckCircle2, CreditCard } from "lucide-react"
import { StatCard } from "../ui/stat-card"

export function OrdersOverviewStats() {
  const stats = [
    {
      icon: ClipboardList,
      title: "Đơn đang mở",
      value: "24",
      subtext: "Tổng đơn active",
      iconColor: "text-slate-600 dark:text-slate-400",
      iconBgColor: "bg-slate-50 dark:bg-slate-800",
    },
    {
      icon: Clock,
      title: "Chờ xác nhận",
      value: "6",
      subtext: "New/Pending",
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBgColor: "bg-amber-50 dark:bg-amber-500/10",
    },
    {
      icon: ChefHat,
      title: "Đang chuẩn bị",
      value: "12",
      subtext: "In progress",
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBgColor: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      icon: CheckCircle2,
      title: "Sẵn sàng",
      value: "6",
      subtext: "Ready to serve",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      icon: CreditCard,
      title: "Chưa thanh toán",
      value: "18",
      subtext: "Unpaid orders",
      iconColor: "text-rose-600 dark:text-rose-400",
      iconBgColor: "bg-rose-50 dark:bg-rose-500/10",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          subtext={stat.subtext}
          icon={stat.icon}
          iconColor={stat.iconColor}
          iconBgColor={stat.iconBgColor}
        />
      ))}
    </div>
  )
}

