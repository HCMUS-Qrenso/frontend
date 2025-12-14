import { Suspense } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { QRManagerContent } from "@/components/admin/qr-manager-content"

export default function QRManagerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminLayout>
        <QRManagerContent />
      </AdminLayout>
    </Suspense>
  )
}
