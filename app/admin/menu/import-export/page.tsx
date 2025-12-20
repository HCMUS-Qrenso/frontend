'use client'

import { Suspense, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImportTab } from '@/components/admin/import-tab'
import { ExportDataTab } from '@/components/admin/export-data-tab'
import { Loader2, Upload, Download } from 'lucide-react'

function ImportExportContent() {
  const [activeTab, setActiveTab] = useState('import')

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:inline-grid lg:w-auto">
          <TabsTrigger value="import" className="gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import CSV/Excel</span>
            <span className="sm:hidden">Import</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Data</span>
            <span className="sm:hidden">Export</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          <ImportTab />
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <ExportDataTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
    </div>
  )
}

export default function ImportExportPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ImportExportContent />
    </Suspense>
  )
}
