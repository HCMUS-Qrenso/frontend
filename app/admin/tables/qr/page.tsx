import { Suspense } from 'react'
import { QRManagerContent } from '@/components/admin/qr-manager-content'

export default function QRManagerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QRManagerContent />
    </Suspense>
  )
}
