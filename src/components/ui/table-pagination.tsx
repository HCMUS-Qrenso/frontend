'use client'

import { Button } from '@/src/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/src/lib/utils'

interface TablePaginationProps {
  /** Current page number (1-indexed) */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Total number of items */
  total: number
  /** Items per page */
  limit: number
  /** Label for items (e.g., "bàn", "món", "nhân viên") */
  itemLabel?: string
  /** Callback when page changes */
  onPageChange: (page: number) => void
  /** Maximum visible page buttons (default: 5) */
  maxVisiblePages?: number
}

export function TablePagination({
  currentPage,
  totalPages,
  total,
  limit,
  itemLabel = 'mục',
  onPageChange,
  maxVisiblePages = 5,
}: TablePaginationProps) {
  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * limit + 1
  const endItem = Math.min(currentPage * limit, total)

  // Calculate visible page range
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const half = Math.floor(maxVisiblePages / 2)
    let start = currentPage - half
    let end = currentPage + half

    if (start < 1) {
      start = 1
      end = maxVisiblePages
    } else if (end > totalPages) {
      end = totalPages
      start = totalPages - maxVisiblePages + 1
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Hiển thị {startItem}-{endItem} trên {total} {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full bg-transparent"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Trước
        </Button>
        {visiblePages.map((pageNum) => (
          <Button
            key={pageNum}
            variant="outline"
            size="sm"
            className={cn(
              'h-8 w-8 rounded-full',
              pageNum === currentPage
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                : 'bg-transparent',
            )}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="rounded-full bg-transparent"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Sau
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
