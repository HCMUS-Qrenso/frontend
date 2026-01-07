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
import {
  useResetPasswordMutation,
  useResendInviteMutation,
} from '@/src/features/admin/staff/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { useTranslations } from 'next-intl'

interface StaffPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: Staff
  action: 'reset' | 'resend'
}

export function StaffPasswordDialog({
  open,
  onOpenChange,
  staff,
  action,
}: StaffPasswordDialogProps) {
  const resetPasswordMutation = useResetPasswordMutation()
  const resendInviteMutation = useResendInviteMutation()
  const { handleError } = useErrorHandler()
  const t = useTranslations('staff')

  const isReset = action === 'reset'
  const mutation = isReset ? resetPasswordMutation : resendInviteMutation

  const handleConfirm = async () => {
    try {
      if (isReset) {
        await resetPasswordMutation.mutateAsync(staff.id)
        toast.success(t('resetPasswordSuccess'))
      } else {
        await resendInviteMutation.mutateAsync(staff.id)
        toast.success(t('resendInviteSuccess'))
      }
      onOpenChange(false)
    } catch (error) {
      handleError(
        error,
        isReset ? t('resetPasswordError') : t('resendInviteError'),
      )
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isReset ? t('resetPasswordTitle') : t('resendInviteTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {isReset ? (
              <span dangerouslySetInnerHTML={{ 
                __html: t('resetPasswordDesc', { email: staff.email }).replace(
                  '<strong>',
                  '<strong class="font-semibold">'
                )
              }} />
            ) : (
              <span dangerouslySetInnerHTML={{ 
                __html: t('resendInviteDesc', { email: staff.email }).replace(
                  '<strong>',
                  '<strong class="font-semibold">'
                )
              }} />
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isReset ? t('sendEmail') : t('resendBtn')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
