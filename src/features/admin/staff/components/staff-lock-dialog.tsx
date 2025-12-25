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

interface StaffLockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: Staff
  action: 'lock' | 'unlock'
}

export function StaffLockDialog({ open, onOpenChange, staff, action }: StaffLockDialogProps) {
  const updateStatusMutation = useUpdateStaffStatusMutation()
  const { handleError } = useErrorHandler()

  const isLocking = action === 'lock'

  const handleConfirm = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        id: staff.id,
        payload: { status: isLocking ? 'suspended' : 'active' },
      })
      toast.success(isLocking ? 'Đã khóa tài khoản thành công' : 'Đã mở khóa tài khoản thành công')
      onOpenChange(false)
    } catch (error) {
      handleError(error, isLocking ? 'Không thể khóa tài khoản' : 'Không thể mở khóa tài khoản')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isLocking ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isLocking ? (
              <>
                Bạn có chắc chắn muốn khóa tài khoản <strong>{staff.fullName}</strong>? Họ sẽ không
                thể đăng nhập cho đến khi được mở khóa.
              </>
            ) : (
              <>
                Bạn có chắc chắn muốn mở khóa tài khoản <strong>{staff.fullName}</strong>? Họ sẽ có
                thể đăng nhập trở lại.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={updateStatusMutation.isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={
              isLocking ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLocking ? 'Khóa tài khoản' : 'Mở khóa'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
