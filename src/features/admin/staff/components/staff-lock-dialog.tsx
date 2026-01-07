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
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Staff } from '@/src/features/admin/staff/types'
import { useUpdateStaffStatusMutation } from '@/src/features/admin/staff/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { useTranslations } from 'next-intl'

interface StaffLockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: Staff
  action: 'lock' | 'unlock'
}

export function StaffLockDialog({ open, onOpenChange, staff, action }: StaffLockDialogProps) {
  const updateStatusMutation = useUpdateStaffStatusMutation()
  const { handleError } = useErrorHandler()
  const t = useTranslations('staff')

  const isLocking = action === 'lock'

  const handleConfirm = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        id: staff.id,
        payload: { status: isLocking ? 'suspended' : 'active' },
      })
      toast.success(isLocking ? t('lockSuccess') : t('unlockSuccess'))
      onOpenChange(false)
    } catch (error) {
      handleError(error, isLocking ? t('lockError') : t('unlockError'))
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isLocking ? t('lockTitle') : t('unlockTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {isLocking ? (
              <span
                dangerouslySetInnerHTML={{
                  __html: t('lockDesc', { name: staff.fullName }).replace(
                    '<strong>',
                    '<strong class="font-semibold">',
                  ),
                }}
              />
            ) : (
              <span
                dangerouslySetInnerHTML={{
                  __html: t('unlockDesc', { name: staff.fullName }).replace(
                    '<strong>',
                    '<strong class="font-semibold">',
                  ),
                }}
              />
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={updateStatusMutation.isPending}>
            {t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={
              isLocking ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLocking ? t('lockConfirm') : t('unlockConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
