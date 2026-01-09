'use client'

import type React from 'react'
import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { useImportMenuMutation } from '@/src/features/admin/menu/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { toast } from 'sonner'
import type { ImportMenuMode, ImportMenuResult } from '@/src/features/admin/menu/types'
import { useTranslations } from 'next-intl'

type ImportStep = 1 | 2

interface UploadedFile {
  name: string
  size: number
  file: File
}

export function ImportTab() {
  const [currentStep, setCurrentStep] = useState<ImportStep>(1)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [importMode, setImportMode] = useState<ImportMenuMode>('create')
  const [importResult, setImportResult] = useState<ImportMenuResult | null>(null)

  const { handleErrorWithStatus } = useErrorHandler()
  const importMutation = useImportMenuMutation()
  const t = useTranslations('menu.importExport')

  const steps = [
    { number: 1, title: t('steps.upload'), description: t('steps.uploadDesc') },
    { number: 2, title: t('steps.result'), description: t('steps.resultDesc') },
  ]

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('import.fileTooLarge'))
        return
      }
      // Validate file type
      const ext = file.name.toLowerCase()
      if (!ext.endsWith('.csv') && !ext.endsWith('.xlsx') && !ext.endsWith('.xls')) {
        toast.error(t('import.invalidFormat'))
        return
      }
      setUploadedFile({
        name: file.name,
        size: file.size,
        file,
      })
    }
  }

  const handleImport = async () => {
    if (!uploadedFile) return

    try {
      const result = await importMutation.mutateAsync({
        file: uploadedFile.file,
        mode: importMode,
      })
      setImportResult(result)
      setCurrentStep(2)
      toast.success(
        t('import.success', { created: result.data.created, updated: result.data.updated }),
      )
    } catch (error) {
      handleErrorWithStatus(error, undefined, t('import.error'))
    }
  }

  const handleReset = () => {
    setCurrentStep(1)
    setUploadedFile(null)
    setImportResult(null)
    setImportMode('create')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-center gap-8">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-colors',
                    currentStep >= step.number
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600',
                  )}
                >
                  {currentStep > step.number ? <CheckCircle2 className="h-5 w-5" /> : step.number}
                </div>
                <div>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      currentStep >= step.number
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-400 dark:text-slate-600',
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">{step.description}</p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-8 h-0.5 w-16 transition-colors',
                    currentStep > step.number ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800',
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Step 1: Upload File */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            {!uploadedFile ? (
              <label className="group block cursor-pointer">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-8 py-12 transition-colors group-hover:border-emerald-400 group-hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:group-hover:border-emerald-600 dark:group-hover:bg-emerald-500/5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <Upload className="h-8 w-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-slate-900 dark:text-white">
                      {t('import.dropZone')}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {t('import.supportedFormats')}
                    </p>
                  </div>
                </div>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {uploadedFile.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setUploadedFile(null)}
                    className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('import.importMode')}
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      {
                        value: 'create',
                        label: t('import.modeCreate'),
                        description: t('import.modeCreateDesc'),
                      },
                      {
                        value: 'update',
                        label: t('import.modeUpdate'),
                        description: t('import.modeUpdateDesc'),
                      },
                      {
                        value: 'upsert',
                        label: t('import.modeUpsert'),
                        description: t('import.modeUpsertDesc'),
                      },
                    ].map((mode) => (
                      <button
                        key={mode.value}
                        onClick={() => setImportMode(mode.value as ImportMenuMode)}
                        className={cn(
                          'rounded-xl border-2 p-4 text-left transition-all',
                          importMode === mode.value
                            ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10'
                            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
                        )}
                      >
                        <p className="font-medium text-slate-900 dark:text-white">{mode.label}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {mode.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Download Template */}
          <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Download className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-slate-900 dark:text-white">{t('import.downloadTemplate')}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {t('import.templateHint')}
                </p>
                <div className="mt-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('import.supportedColumns')}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleImport}
              disabled={!uploadedFile || importMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('import.importing')}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {t('import.importNow')}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Results */}
      {currentStep === 2 && importResult && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card className="rounded-xl border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {importResult.data.created}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('import.created')}</p>
                </div>
              </div>
            </Card>
            <Card className="rounded-xl border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {importResult.data.updated}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('import.updated')}</p>
                </div>
              </div>
            </Card>
            <Card className="rounded-xl border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {importResult.data.skipped}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('import.skipped')}</p>
                </div>
              </div>
            </Card>
            <Card className="rounded-xl border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                  <X className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {importResult.data.errors?.length || 0}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('import.errors')}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Error Details */}
          {importResult.data.errors && importResult.data.errors.length > 0 && (
            <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
                {t('import.errorDetails')} ({importResult.data.errors.length})
              </h3>
              <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-300">
                        {t('import.row')}
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-300">
                        {t('import.field')}
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-300">
                        {t('import.errors')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {importResult.data.errors.map((err, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-slate-900 dark:text-white">{err.row}</td>
                        <td className="px-4 py-2">
                          <Badge variant="secondary">{err.field}</Badge>
                        </td>
                        <td className="px-4 py-2 text-rose-600 dark:text-rose-400">
                          {err.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Success Message */}
          {(!importResult.data.errors || importResult.data.errors.length === 0) && (
            <Card className="rounded-2xl border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-500/5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">
                    {t('import.complete')}
                  </h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    {t('import.allSuccess')}
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="flex justify-end">
            <Button onClick={handleReset} className="bg-emerald-600 hover:bg-emerald-700">
              {t('import.importAnother')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

