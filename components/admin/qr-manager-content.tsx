'use client'

import { useState, useMemo } from 'react'
import { QRManagerStats } from './qr-manager-stats'
import { QRManagerToolbar } from './qr-manager-toolbar'
import { QRTableList } from './qr-table-list'
import { QRPreviewModal } from './qr-preview-modal'
import { QRBatchPrintDialog } from './qr-batch-print-dialog'
import { QRSecurityModal } from './qr-security-modal'
import {
  useQRCodesQuery,
  useBatchGenerateQRMutation,
  useGenerateQRMutation,
  useQrStatsQuery,
} from '@/hooks/use-tables-query'
import { useZonesSimpleQuery } from '@/hooks/use-zones-query'
import { tablesApi } from '@/lib/api/tables'
import { downloadBlobWithHeaders } from '@/lib/utils/download'
import { toast } from 'sonner'
import { useErrorHandler } from '@/hooks/use-error-handler'
import { Loader2 } from 'lucide-react'
import { QrStats, type QRStatus, type TableQR } from '@/types/tables'

// Helper function to map backend QR status to UI status
// API returns title case: "Missing", "Ready", "Outdated"
function mapQRStatus(status: string): TableQR['status'] {
  const statusMap: Record<string, TableQR['status']> = {
    Ready: 'Ready',
    Missing: 'Missing',
    Outdated: 'Outdated',
    ready: 'Ready',
    missing: 'Missing',
    outdated: 'Outdated',
  }
  return statusMap[status] || 'Missing'
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

// Transform API response table item to TableQR
// API returns camelCase: { id, tableNumber, tableZone, seats, qrUrl, orderingUrl, status, updatedAt }
function transformQRToTableQR(qr: {
  id: string
  tableNumber: string
  tableZone: string
  seats: number
  qrUrl: string | null
  orderingUrl: string | null
  status: 'Missing' | 'Ready' | 'Outdated'
  updatedAt: string | null
}): TableQR {
  return {
    id: qr.id,
    tableNumber: qr.tableNumber,
    tableArea: qr.tableZone || '—',
    qrUrl: qr.qrUrl || '',
    qrLink: qr.orderingUrl || '',
    status: mapQRStatus(qr.status),
    updatedAt: formatDate(qr.updatedAt),
    seats: qr.seats || 0,
  }
}

// Transform single QR detail (snake_case) to TableQR
function transformSingleQRDetail(qr: {
  id: string
  table_number: string
  tableZone?: string | null
  seats?: number | null
  qr_code_url: string | null
  ordering_url: string | null
  status: string
  qr_code_generated_at: string | null
}): TableQR {
  return {
    id: qr.id,
    tableNumber: qr.table_number,
    tableArea: qr.tableZone || '—',
    qrUrl: qr.qr_code_url || '',
    qrLink: qr.ordering_url || '',
    status: mapQRStatus(qr.status),
    updatedAt: formatDate(qr.qr_code_generated_at),
    seats: qr.seats || 0,
  }
}

export function QRManagerContent() {
  const [selectedQR, setSelectedQR] = useState<TableQR | null>(null)
  const [showBatchDialog, setShowBatchDialog] = useState(false)
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState<QRStatus | undefined>(undefined)
  const [zoneFilter, setZoneFilter] = useState<string | undefined>(undefined)
  const [overrides, setOverrides] = useState<Record<string, TableQR>>({})

  const { handleError } = useErrorHandler()
  const { data: zonesData } = useZonesSimpleQuery()
  const zones =
    zonesData?.zones ??
    ((zonesData as { zones?: Array<{ id: string; name: string }> } | undefined)?.zones || [])

  const {
    data: qrData,
    isLoading,
    error,
  } = useQRCodesQuery(
    {
      status: statusFilter,
      zone_id: zoneFilter,
    },
    true,
  )

  const batchGenerateMutation = useBatchGenerateQRMutation()
  const generateMutation = useGenerateQRMutation()

  const { data: qrStatsData } = useQrStatsQuery()

  const tableQRs = useMemo(() => {
    if (!qrData?.data.tables) return []
    const base = qrData.data.tables.map(transformQRToTableQR)
    return base.map((t) => overrides[t.id] || t)
  }, [qrData, overrides])

  const refreshSingleQR = async (tableId: string) => {
    try {
      const detail = await tablesApi.getQRCode(tableId)
      if (detail?.data) {
        const mapped = transformSingleQRDetail(detail.data)
        setOverrides((prev) => ({ ...prev, [tableId]: mapped }))
      }
    } catch (error) {
      // Silent refresh errors; main generate already handled by mutation
      console.error('Failed to refresh QR detail', error)
    }
  }

  const handleGenerateAll = async (forceRegenerate: boolean) => {
    if (tableQRs.length === 0) {
      toast.info('Không có bàn nào để tạo QR')
      return
    }

    try {
      const allTableIds = tableQRs.map((t) => t.id)
      await batchGenerateMutation.mutateAsync({
        table_ids: allTableIds,
        force_regenerate: forceRegenerate,
      })
      toast.success(
        forceRegenerate 
          ? 'Đã tạo lại QR cho tất cả bàn thành công' 
          : 'Đã tạo QR cho các bàn thiếu thành công'
      )
    } catch (error) {
      handleError(error)
    }
  }

  const handleBatchGenerate = async (forceRegenerate: boolean) => {
    if (selectedTables.length === 0) {
      toast.info('Vui lòng chọn ít nhất một bàn')
      return
    }

    try {
      await batchGenerateMutation.mutateAsync({
        table_ids: selectedTables,
        force_regenerate: forceRegenerate,
      })
      toast.success(`Đã tạo QR cho ${selectedTables.length} bàn thành công`)
      setSelectedTables([])
      setShowBatchDialog(false)
    } catch (error) {
      handleError(error)
    }
  }

  const handleDownloadAll = async (format: 'png' | 'pdf' | 'zip' = 'zip') => {
    try {
      const blob = await tablesApi.downloadAllQR(format)
      const extension = format === 'zip' ? 'zip' : format === 'pdf' ? 'pdf' : 'png'
      downloadBlobWithHeaders(blob, {}, `qr-codes-all.${extension}`)
      toast.success('Đã tải xuống tất cả QR codes')
    } catch (error) {
      handleError(error)
    }
  }

  const handleDownloadQR = async (tableId: string, format: 'png' | 'pdf' = 'png') => {
    try {
      const blob = await tablesApi.downloadQR(tableId, format)
      const table = tableQRs.find((t) => t.id === tableId)
      const filename = `qr-table-${table?.tableNumber || tableId}.${format}`
      downloadBlobWithHeaders(blob, {}, filename)
      toast.success('Đã tải xuống QR code')
    } catch (error) {
      handleError(error)
    }
  }

  const handleGenerateQR = async (tableId: string, forceRegenerate = false) => {
    try {
      await generateMutation.mutateAsync({ tableId, forceRegenerate })
      toast.success(forceRegenerate ? 'Đã tạo lại QR code thành công' : 'Đã tạo QR code thành công')
      await refreshSingleQR(tableId)
    } catch (error) {
      handleError(error)
    }
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
      <QRManagerStats {...(qrStatsData?.data || {})} />

      {/* Main content grid */}
      <div className="space-y-4">
        <QRManagerToolbar
          zones={zones}
          statusFilter={statusFilter}
          zoneFilter={zoneFilter}
          onStatusFilterChange={setStatusFilter}
          onZoneFilterChange={setZoneFilter}
          onGenerateAll={handleGenerateAll}
          onDownloadAll={handleDownloadAll}
          onSecurityInfo={() => setShowSecurityModal(true)}
          isLoading={batchGenerateMutation.isPending}
        />
        <QRTableList
          tables={tableQRs}
          selectedTables={selectedTables}
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
          onDownload={(tableId, format) => handleDownloadQR(tableId, format)}
          onGenerate={(tableId, forceRegenerate) => handleGenerateQR(tableId, forceRegenerate)}
          onBatchGenerate={(forceRegenerate) => handleBatchGenerate(forceRegenerate)}
          onBatchDownload={(format) => {
            // For batch download, we'll download individual QRs
            Promise.all(selectedTables.map((id) => handleDownloadQR(id, format)))
          }}
          isLoading={generateMutation.isPending || batchGenerateMutation.isPending}
          isDataLoading={isLoading}
        />
      </div>

      {/* Modals */}
      {selectedQR && <QRPreviewModal table={selectedQR} onClose={() => setSelectedQR(null)} />}
      {showBatchDialog && (
        <QRBatchPrintDialog
          selectedCount={selectedTables.length}
          totalCount={tableQRs.length}
          onClose={() => setShowBatchDialog(false)}
          onGenerate={(forceRegenerate) => handleBatchGenerate(forceRegenerate)}
          isLoading={batchGenerateMutation.isPending}
        />
      )}
      {showSecurityModal && <QRSecurityModal onClose={() => setShowSecurityModal(false)} />}
    </div>
  )
}
