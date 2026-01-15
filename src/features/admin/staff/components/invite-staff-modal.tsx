'use client'

import { useState, useEffect } from 'react'
import { FormDialog, FormDialogField } from '@/src/components/ui/form-dialog'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Badge } from '@/src/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { toast } from 'sonner'
import { useCreateStaffMutation } from '@/src/features/admin/staff/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { useAuth } from '@/src/features/auth/hooks'
import { inviteStaffSchema } from '@/src/features/admin/staff/schemas'
import { useTranslations } from 'next-intl'

type StaffRole = 'admin' | 'waiter' | 'kitchen_staff'

interface InviteStaffSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultRole: 'waiter' | 'kitchen_staff'
}

export function InviteStaffModal({ open, onOpenChange, defaultRole }: InviteStaffSheetProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<StaffRole>(defaultRole)
  const t = useTranslations('staff')

  const { user } = useAuth()
  const createMutation = useCreateStaffMutation()
  const { handleError } = useErrorHandler()

  // Check if current user is Owner
  const isOwner = user?.role === 'owner'

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFullName('')
      setEmail('')
      setPhone('')
      setRole(defaultRole)
    }
  }, [open, defaultRole])

  // Update role when defaultRole changes
  useEffect(() => {
    setRole(defaultRole)
  }, [defaultRole])

  const handleSubmit = async () => {
    // Validate with Zod schema
    const result = inviteStaffSchema.safeParse({
      fullName,
      email,
      phone: phone || undefined,
      role,
    })

    if (!result.success) {
      const firstError = result.error.issues[0]
      toast.error(firstError?.message || t('invalidData'))
      return
    }

    try {
      await createMutation.mutateAsync({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        role,
      })

      toast.success(t('inviteSuccess'))
      onOpenChange(false)
    } catch (error) {
      handleError(error, t('inviteError'))
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('inviteTitle')}
      description={t('inviteDesc')}
      onSubmit={handleSubmit}
      isSubmitting={createMutation.isPending}
      submitText={t('sendInvite')}
      loadingText={t('sendingInvite')}
      size="md"
    >
      {/* Họ và tên */}
      <FormDialogField label={t('fullNameLabel')} required>
        <Input
          id="full_name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder={t('fullNamePlaceholder')}
          disabled={createMutation.isPending}
        />
      </FormDialogField>

      {/* Email */}
      <FormDialogField label={t('email')} required>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          disabled={createMutation.isPending}
        />
      </FormDialogField>

      {/* Số điện thoại */}
      <FormDialogField label={t('phone')}>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('phonePlaceholder')}
          disabled={createMutation.isPending}
        />
      </FormDialogField>

      {/* Vai trò */}
      <FormDialogField label={t('role')}>
        <Select
          value={role}
          onValueChange={(value) => setRole(value as StaffRole)}
          disabled={createMutation.isPending}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder={t('selectRole')} />
          </SelectTrigger>
          <SelectContent>
            {/* Admin option - Only visible for Owner */}
            {isOwner && (
              <SelectItem value="admin">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  {t('admin')}
                </span>
              </SelectItem>
            )}
            <SelectItem value="waiter">{t('waiter')}</SelectItem>
            <SelectItem value="kitchen_staff">{t('kitchenStaff')}</SelectItem>
          </SelectContent>
        </Select>
      </FormDialogField>

      {/* Trạng thái ban đầu */}
      <div className="space-y-2">
        <Label>{t('initialStatus')}</Label>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            {t('active')}
          </Badge>
          <span className="text-xs text-slate-500">{t('defaultActive')}</span>
        </div>
      </div>
    </FormDialog>
  )
}
