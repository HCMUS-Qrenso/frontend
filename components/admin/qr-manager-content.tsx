"use client"

import { useState } from "react"
import { QRManagerStats } from "./qr-manager-stats"
import { QRManagerToolbar } from "./qr-manager-toolbar"
import { QRTableList } from "./qr-table-list"
import { QRPreviewModal } from "./qr-preview-modal"
import { QRBatchPrintDialog } from "./qr-batch-print-dialog"
import { QRSecurityModal } from "./qr-security-modal"

export interface TableQR {
  id: string
  tableNumber: string
  tableArea: string
  qrUrl: string
  qrLink: string
  status: "Ready" | "Missing" | "Outdated"
  updatedAt: string
  seats: number
}

const mockTableQRs: TableQR[] = [
  {
    id: "1",
    tableNumber: "1",
    tableArea: "Tầng 1 - Khu cửa sổ",
    qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://smart-restaurant.com/r/demo/t/1",
    qrLink: "https://smart-restaurant.com/r/demo/t/1",
    status: "Ready",
    updatedAt: "2024-01-15 14:30",
    seats: 4,
  },
  {
    id: "2",
    tableNumber: "2",
    tableArea: "Tầng 1 - Khu cửa sổ",
    qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://smart-restaurant.com/r/demo/t/2",
    qrLink: "https://smart-restaurant.com/r/demo/t/2",
    status: "Ready",
    updatedAt: "2024-01-15 14:30",
    seats: 2,
  },
  {
    id: "3",
    tableNumber: "3",
    tableArea: "Tầng 1 - Trung tâm",
    qrUrl: "",
    qrLink: "https://smart-restaurant.com/r/demo/t/3",
    status: "Missing",
    updatedAt: "—",
    seats: 6,
  },
  {
    id: "4",
    tableNumber: "4",
    tableArea: "Tầng 1 - Trung tâm",
    qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://smart-restaurant.com/r/demo/t/4",
    qrLink: "https://smart-restaurant.com/r/demo/t/4",
    status: "Ready",
    updatedAt: "2024-01-15 14:30",
    seats: 4,
  },
  {
    id: "5",
    tableNumber: "5",
    tableArea: "Tầng 2 - VIP",
    qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://smart-restaurant.com/r/demo/t/5",
    qrLink: "https://smart-restaurant.com/r/demo/t/5",
    status: "Ready",
    updatedAt: "2024-01-10 09:15",
    seats: 4,
  },
  {
    id: "6",
    tableNumber: "6",
    tableArea: "Tầng 2 - VIP",
    qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://smart-restaurant.com/r/demo/t/6",
    qrLink: "https://smart-restaurant.com/r/demo/t/6",
    status: "Outdated",
    updatedAt: "2023-12-20 11:00",
    seats: 8,
  },
  {
    id: "7",
    tableNumber: "7",
    tableArea: "Tầng 2 - Khu ban công",
    qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://smart-restaurant.com/r/demo/t/7",
    qrLink: "https://smart-restaurant.com/r/demo/t/7",
    status: "Ready",
    updatedAt: "2024-01-15 14:30",
    seats: 2,
  },
  {
    id: "8",
    tableNumber: "8",
    tableArea: "Khu ngoài trời",
    qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://smart-restaurant.com/r/demo/t/8",
    qrLink: "https://smart-restaurant.com/r/demo/t/8",
    status: "Ready",
    updatedAt: "2024-01-15 14:30",
    seats: 4,
  },
  {
    id: "9",
    tableNumber: "9",
    tableArea: "Khu ngoài trời",
    qrUrl: "",
    qrLink: "https://smart-restaurant.com/r/demo/t/9",
    status: "Missing",
    updatedAt: "—",
    seats: 4,
  },
  {
    id: "10",
    tableNumber: "10",
    tableArea: "Tầng 1 - Trung tâm",
    qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://smart-restaurant.com/r/demo/t/10",
    qrLink: "https://smart-restaurant.com/r/demo/t/10",
    status: "Ready",
    updatedAt: "2024-01-15 14:30",
    seats: 6,
  },
]

export function QRManagerContent() {
  const [selectedQR, setSelectedQR] = useState<TableQR | null>(null)
  const [showBatchDialog, setShowBatchDialog] = useState(false)
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [showSecurityModal, setShowSecurityModal] = useState(false)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <QRManagerStats tables={mockTableQRs} />

      {/* Main content grid */}
      <div className="space-y-4">
        <QRManagerToolbar
          onGenerateAll={() => {}}
          onPrintBatch={() => setShowBatchDialog(true)}
          onSecurityInfo={() => setShowSecurityModal(true)}
        />
        <QRTableList
          tables={mockTableQRs}
          selectedTables={selectedTables}
          onSelectTable={(id) => {
            setSelectedTables((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
          }}
          onSelectAll={() => {
            setSelectedTables(selectedTables.length === mockTableQRs.length ? [] : mockTableQRs.map((t) => t.id))
          }}
          onPreview={(table) => setSelectedQR(table)}
        />
      </div>

      {/* Modals */}
      {selectedQR && <QRPreviewModal table={selectedQR} onClose={() => setSelectedQR(null)} />}
      {showBatchDialog && (
        <QRBatchPrintDialog
          selectedCount={selectedTables.length}
          totalCount={mockTableQRs.length}
          onClose={() => setShowBatchDialog(false)}
        />
      )}
      {showSecurityModal && <QRSecurityModal onClose={() => setShowSecurityModal(false)} />}
    </div>
  )
}
