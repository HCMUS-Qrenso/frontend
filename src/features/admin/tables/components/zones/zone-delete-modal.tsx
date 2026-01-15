'use client'

import { ConfirmDeleteDialog } from '@/src/components/ui/confirm-delete-dialog'
import { useDeleteZoneMutation } from '@/src/features/admin/tables/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { toast } from 'sonner'
import type { Zone } from '@/src/features/admin/tables/types'
import { useTranslations } from 'next-intl'

interface ZoneDeleteModalProps {
  open: boolean
  zone: Zone | null
  onOpenChange: (open: boolean) => void
}

export function ZoneDeleteModal({ open, zone, onOpenChange }: ZoneDeleteModalProps) {
  const t = useTranslations('tables')
  const zoneName = zone?.name || t('thisZone')

  const deleteMutation = useDeleteZoneMutation()
  const { handleErrorWithStatus } = useErrorHandler()

  const isDeleting = deleteMutation.isPending

  const handleConfirmDelete = async () => {
    if (!zone) return

    try {
      await deleteMutation.mutateAsync(zone.id)
      toast.success(t('zoneDeletedSuccess'))
      onOpenChange(false)
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 409) {
        const backendMessage = error?.response?.data?.message
        const message = Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage || t('cannotDeleteZoneWithTables')
        toast.error(message)
      } else {
        handleErrorWithStatus(error, undefined, t('cannotDeleteZone'))
      }
    }
  }

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('deleteZoneTitle')}
      description={t('deleteZoneDesc')}
      itemName={zoneName !== t('thisZone') ? zoneName : undefined}
      onConfirm={handleConfirmDelete}
      isLoading={isDeleting}
      confirmText={t('confirmDeleteZone')}
    />
  )
}
