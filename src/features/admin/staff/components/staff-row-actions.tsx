'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { MoreVertical, Pencil, Lock, Unlock, Key, Mail, Trash2 } from 'lucide-react'
import type { Staff } from '@/src/features/admin/staff/types/staff'
import { StaffEditDialog } from './staff-edit-dialog'
import { StaffLockDialog } from './staff-lock-dialog'
import { StaffDeleteDialog } from './staff-delete-dialog'
import { StaffPasswordDialog } from './staff-password-dialog'

interface StaffRowActionsProps {
  staff: Staff
}

type DialogType = 'edit' | 'lock' | 'unlock' | 'resetPassword' | 'resendInvite' | 'delete' | null

export function StaffRowActions({ staff }: StaffRowActionsProps) {
  const [activeDialog, setActiveDialog] = useState<DialogType>(null)

  const closeDialog = () => setActiveDialog(null)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setActiveDialog('edit')}>
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>

          {staff.emailVerified ? (
            <DropdownMenuItem onClick={() => setActiveDialog('resetPassword')}>
              <Key className="mr-2 h-4 w-4" />
              Reset mật khẩu
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setActiveDialog('resendInvite')}>
              <Mail className="mr-2 h-4 w-4" />
              Gửi lại lời mời
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {staff.status === 'suspended' ? (
            <DropdownMenuItem onClick={() => setActiveDialog('unlock')} className="text-emerald-600">
              <Unlock className="mr-2 h-4 w-4" />
              Mở khóa
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setActiveDialog('lock')} className="text-red-600">
              <Lock className="mr-2 h-4 w-4" />
              Khóa tài khoản
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => setActiveDialog('delete')} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa nhân viên
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <StaffEditDialog
        open={activeDialog === 'edit'}
        onOpenChange={(open) => !open && closeDialog()}
        staff={staff}
      />

      {/* Lock/Unlock Dialog */}
      <StaffLockDialog
        open={activeDialog === 'lock' || activeDialog === 'unlock'}
        onOpenChange={(open) => !open && closeDialog()}
        staff={staff}
        action={activeDialog === 'lock' ? 'lock' : 'unlock'}
      />

      {/* Delete Dialog */}
      <StaffDeleteDialog
        open={activeDialog === 'delete'}
        onOpenChange={(open) => !open && closeDialog()}
        staff={staff}
      />

      {/* Password/Invite Dialog */}
      <StaffPasswordDialog
        open={activeDialog === 'resetPassword' || activeDialog === 'resendInvite'}
        onOpenChange={(open) => !open && closeDialog()}
        staff={staff}
        action={activeDialog === 'resetPassword' ? 'reset' : 'resend'}
      />
    </>
  )
}
