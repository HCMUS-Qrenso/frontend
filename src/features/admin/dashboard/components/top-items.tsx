'use client'

import { cn } from '@/src/lib/utils'

interface TopItem {
  id: string
  name: string
  image: string
  sold: number
  revenue: number
}

const topItems: TopItem[] = [
  { id: '1', name: 'Phở bò tái chín', image: '/pho-bo-vietnamese.jpg', sold: 45, revenue: 2925000 },
  { id: '2', name: 'Bún chả Hà Nội', image: '/bun-cha-hanoi.jpg', sold: 38, revenue: 2850000 },
  {
    id: '3',
    name: 'Bánh mì thịt nướng',
    image: '/banh-mi-vietnamese.jpg',
    sold: 32,
    revenue: 1280000,
  },
  { id: '4', name: 'Cơm tấm sườn bì', image: '/com-tam-suon-bi.jpg', sold: 28, revenue: 1960000 },
  {
    id: '5',
    name: 'Gỏi cuốn tôm thịt',
    image: '/goi-cuon-tom-thit.jpg',
    sold: 25,
    revenue: 1125000,
  },
  { id: '6', name: 'Cà phê sữa đá', image: '/ca-phe-sua-da.jpg', sold: 68, revenue: 2040000 },
]

interface TopItemsProps {
  className?: string
}

export function TopItems({ className }: TopItemsProps) {
  const maxSold = Math.max(...topItems.map((item) => item.sold))

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
    >
      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-white">Top món hôm nay</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Món bán chạy nhất</p>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {topItems.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-6 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {/* Rank */}
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {index + 1}
            </div>

            {/* Image */}
            <img
              src={item.image || '/placeholder.svg'}
              alt={item.name}
              className="h-12 w-12 flex-shrink-0 rounded-xl object-cover"
            />

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                {item.name}
              </p>
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>{item.sold} đã bán</span>
                <span>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    notation: 'compact',
                  }).format(item.revenue)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${(item.sold / maxSold) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
