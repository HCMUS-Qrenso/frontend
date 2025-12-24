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
import type { Staff } from '@/src/features/admin/staff/types/staff'
import {
  useResetPasswordMutation,
  useResendInviteMutation,
} from '@/src/features/admin/staff/queries/staff.queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'

interface StaffPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: Staff
  action: 'reset' | 'resend'
}

export function StaffPasswordDialog({ open, onOpenChange, staff, action }: StaffPasswordDialogProps) {
  const resetPasswordMutation = useResetPasswordMutation()
  const resendInviteMutation = useResendInviteMutation()
  const { handleError } = useErrorHandler()

  const isReset = action === 'reset'
  const mutation = isReset ? resetPasswordMutation : resendInviteMutation

  const handleConfirm = async () => {
    try {
      if (isReset) {
        await resetPasswordMutation.mutateAsync(staff.id)
        toast.success('Đã gửi email reset mật khẩu')
      } else {
        await resendInviteMutation.mutateAsync(staff.id)
        toast.success('Đã gửi lại email mời thành công')
      }
      onOpenChange(false)
    } catch (error) {
      handleError(
        error,
        isReset ? 'Không thể gửi email reset mật khẩu' : 'Không thể gửi lại email mời'
      )
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isReset ? 'Reset mật khẩu?' : 'Gửi lại lời mời?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isReset ? (
              <>
                Gửi email reset mật khẩu đến <strong>{staff.email}</strong>? Nhân viên sẽ nhận được
                link để tạo mật khẩu mới.
              </>
            ) : (
              <>
                Gửi lại email mời đến <strong>{staff.email}</strong>? Nhân viên sẽ nhận được link mới
                để thiết lập mật khẩu.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isReset ? 'Gửi email' : 'Gửi lại'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
