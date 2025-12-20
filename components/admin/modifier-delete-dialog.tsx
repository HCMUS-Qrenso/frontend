'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog'
import { Loader2 } from 'lucide-react'
import { useDeleteModifierMutation, useModifiersQuery } from '@/hooks/use-modifiers-query'
import { useErrorHandler } from '@/hooks/use-error-handler'
import { toast } from 'sonner'

interface ModifierDeleteDialogProps {
  selectedGroupId: string | null
}

export function ModifierDeleteDialog({ selectedGroupId }: ModifierDeleteDialogProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const open = searchParams.get('delete') === 'modifier'
  const modifierId = searchParams.get('id')
  const { handleErrorWithStatus } = useErrorHandler()

  // Fetch modifiers to get the name
  const { data: modifiersData, isLoading: isLoadingModifiers } = useModifiersQuery(
    selectedGroupId,
    { include_unavailable: true },
    open && !!selectedGroupId && !!modifierId,
  )

  // Mutation
  const deleteMutation = useDeleteModifierMutation()

  const modifier = modifiersData?.data.modifiers.find((m) => m.id === modifierId)
  const modifierName = modifier?.name || ''
  const isDeleting = deleteMutation.isPending

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('delete')
    params.delete('id')
    router.push(`?${params.toString()}`)
  }

  const handleDelete = async () => {
    if (!modifierId || !selectedGroupId) return

    deleteMutation.mutate(
      { id: modifierId, groupId: selectedGroupId },
      {
        onSuccess: () => {
          toast.success('Đã xoá option')
          handleClose()
        },
        onError: (error: any) => {
          handleErrorWithStatus(error)
          toast.error('Không thể xoá option')
        },
      },
    )
  }

  // Show loading while fetching modifier data
  if (isLoadingModifiers && open) {
    return (
      <ConfirmDeleteDialog
        open={open}
        onOpenChange={handleClose}
        title="Đang tải..."
        description=""
        onConfirm={() => {}}
        isLoading={true}
        confirmDisabled={true}
      />
    )
  }

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={handleClose}
      title="Xác nhận xoá option"
      description="Hành động này không thể hoàn tác."
      itemName={modifierName}
      onConfirm={handleDelete}
      isLoading={isDeleting}
      confirmText="Xoá option"
    />
  )
}

