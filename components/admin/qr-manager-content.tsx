'use client'

import { useState, useMemo } from 'react'
import { QRManagerStats } from './qr-manager-stats'
import { QRManagerToolbar } from './qr-manager-toolbar'
import { QRTableList } from './qr-table-list'
import { QRPreviewModal } from './qr-preview-modal'
import { QRBatchPrintDialog } from './qr-batch-print-dialog'
import { QRSecurityModal } from './qr-security-modal'
import { useTablesQuery } from '@/hooks/use-tables-query'
import { Loader2 } from 'lucide-react'
import type { Table } from '@/types/tables'

export interface TableQR {
  id: string
  tableNumber: string
  tableArea: string
  qrUrl: string
  qrLink: string
  status: 'Ready' | 'Missing' | 'Outdated'
  updatedAt: string
  seats: number
}

// Helper function to calculate QR status
function calculateQRStatus(table: Table): TableQR['status'] {
  if (!table.qr_code_url) {
    return 'Missing'
  }

  if (!table.qr_code_generated_at) {
    return 'Missing'
  }

  // Check if QR is outdated (older than 30 days)
  const generatedDate = new Date(table.qr_code_generated_at)
  const daysSinceGenerated = (Date.now() - generatedDate.getTime()) / (1000 * 60 * 60 * 24)

  if (daysSinceGenerated > 30) {
    return 'Outdated'
  }

  return 'Ready'
}

// Helper function to format date
function formatDate(dateString: string | null): string {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

// Transform Table to TableQR
function transformTableToQR(table: Table): TableQR {
  return {
    id: table.id,
    tableNumber: table.table_number,
    tableArea: table.zone_name || table.floor || '—',
    qrUrl: table.qr_code_url || '',
    qrLink: table.ordering_url || '',
    status: calculateQRStatus(table),
    updatedAt: formatDate(table.qr_code_generated_at),
    seats: table.capacity,
  }
}

const mockTableQRs: TableQR[] = [
  {
    id: '1',
    tableNumber: '1',
    tableArea: 'Tầng 1 - Khu cửa sổ',
    qrUrl:
      'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://smart-restaurant.com/r/demo/t/1',
    qrLink: 'https://smart-restaurant.com/r/demo/t/1',
    status: 'Ready',
    updatedAt: '2024-01-15 14:30',
    seats: 4,
  },
  {
    id: '2',
    tableNumber: '2',
    tableArea: 'Tầng 1 - Khu cửa sổ',
    qrUrl:
      'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://smart-restaurant.com/r/demo/t/2',
    qrLink: 'https://smart-restaurant.com/r/demo/t/2',
    status: 'Ready',
    updatedAt: '2024-01-15 14:30',
    seats: 2,
  },
  {
    id: '3',
    tableNumber: '3',
    tableArea: 'Tầng 1 - Trung tâm',
    qrUrl: '',
    qrLink: 'https://smart-restaurant.com/r/demo/t/3',
    status: 'Missing',
    updatedAt: '—',
    seats: 6,
  },
  {
    id: '4',
    tableNumber: '4',
    tableArea: 'Tầng 1 - Trung tâm',
    qrUrl:
      'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://smart-restaurant.com/r/demo/t/4',
    qrLink: 'https://smart-restaurant.com/r/demo/t/4',
    status: 'Ready',
    updatedAt: '2024-01-15 14:30',
    seats: 4,
  },
  {
    id: '5',
    tableNumber: '5',
    tableArea: 'Tầng 2 - VIP',
    qrUrl:
      'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://smart-restaurant.com/r/demo/t/5',
    qrLink: 'https://smart-restaurant.com/r/demo/t/5',
    status: 'Ready',
    updatedAt: '2024-01-10 09:15',
    seats: 4,
  },
  {
    id: '6',
    tableNumber: '6',
    tableArea: 'Tầng 2 - VIP',
    qrUrl:
      'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://smart-restaurant.com/r/demo/t/6',
    qrLink: 'https://smart-restaurant.com/r/demo/t/6',
    status: 'Outdated',
    updatedAt: '2023-12-20 11:00',
    seats: 8,
  },
  {
    id: '7',
    tableNumber: '7',
    tableArea: 'Tầng 2 - Khu ban công',
    qrUrl:
      'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://smart-restaurant.com/r/demo/t/7',
    qrLink: 'https://smart-restaurant.com/r/demo/t/7',
    status: 'Ready',
    updatedAt: '2024-01-15 14:30',
    seats: 2,
  },
  {
    id: '8',
    tableNumber: '8',
    tableArea: 'Khu ngoài trời',
    qrUrl:
      'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://smart-restaurant.com/r/demo/t/8',
    qrLink: 'https://smart-restaurant.com/r/demo/t/8',
    status: 'Ready',
    updatedAt: '2024-01-15 14:30',
    seats: 4,
  },
  {
    id: '9',
    tableNumber: '9',
    tableArea: 'Khu ngoài trời',
    qrUrl: '',
    qrLink: 'https://smart-restaurant.com/r/demo/t/9',
    status: 'Missing',
    updatedAt: '—',
    seats: 4,
  },
  {
    id: '10',
    tableNumber: '10',
    tableArea: 'Tầng 1 - Trung tâm',
    qrUrl:
      'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://smart-restaurant.com/r/demo/t/10',
    qrLink: 'https://smart-restaurant.com/r/demo/t/10',
    status: 'Ready',
    updatedAt: '2024-01-15 14:30',
    seats: 6,
  },
]

export function QRManagerContent() {
  const [page, setPage] = useState(1)
  const limit = 10 // 10 tables per page
  const { data, isLoading, error } = useTablesQuery({ page, limit })
  const [selectedQR, setSelectedQR] = useState<TableQR | null>(null)
  const [showBatchDialog, setShowBatchDialog] = useState(false)
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [showSecurityModal, setShowSecurityModal] = useState(false)

  const tableQRs = useMemo(() => {
    if (!data?.data.tables) return []
    return data.data.tables.map(transformTableToQR)
  }, [data])

  const pagination = data?.data.pagination

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    setSelectedTables([]) // Clear selection when changing page
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-500/10">
        <p className="text-sm text-red-600 dark:text-red-400">
          Có lỗi xảy ra khi tải danh sách QR. Vui lòng thử lại.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <QRManagerStats tables={tableQRs} />

      {/* Main content grid */}
      <div className="space-y-4">
        <QRManagerToolbar
          onGenerateAll={() => {}}
          onPrintBatch={() => setShowBatchDialog(true)}
          onSecurityInfo={() => setShowSecurityModal(true)}
        />
        <QRTableList
          tables={tableQRs}
          selectedTables={selectedTables}
          pagination={pagination}
          currentPage={page}
          onPageChange={handlePageChange}
          onSelectTable={(id) => {
            setSelectedTables((prev) =>
              prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
            )
          }}
          onSelectAll={() => {
            setSelectedTables(
              selectedTables.length === tableQRs.length ? [] : tableQRs.map((t) => t.id),
            )
          }}
          onPreview={(table) => setSelectedQR(table)}
        />
      </div>

      {/* Modals */}
      {selectedQR && <QRPreviewModal table={selectedQR} onClose={() => setSelectedQR(null)} />}
      {showBatchDialog && (
        <QRBatchPrintDialog
          selectedCount={selectedTables.length}
          totalCount={tableQRs.length}
          onClose={() => setShowBatchDialog(false)}
        />
      )}
      {showSecurityModal && <QRSecurityModal onClose={() => setShowSecurityModal(false)} />}
    </div>
  )
}
