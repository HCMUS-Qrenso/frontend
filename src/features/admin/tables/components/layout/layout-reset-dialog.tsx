'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'
import { Loader2, AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface LayoutResetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading: boolean
}

export function LayoutResetDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: LayoutResetDialogProps) {
  const t = useTranslations('tables')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <AlertDialogTitle className="text-center text-lg font-semibold text-slate-900 dark:text-white">
            {t('resetLayoutTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-sm text-slate-500 dark:text-slate-400">
            {t('resetLayoutDesc')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-end gap-3 sm:flex-row">
          <AlertDialogCancel
            disabled={isLoading}
            className="m-0 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            {t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="m-0 gap-2 rounded-full bg-red-600 hover:bg-red-700"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? t('resettingLayout') : t('resetLayoutBtn')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
