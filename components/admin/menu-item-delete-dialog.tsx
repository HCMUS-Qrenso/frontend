'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog'
import { useMenuItemQuery, useDeleteMenuItemMutation } from '@/hooks/use-menu-items-query'
import { useErrorHandler } from '@/hooks/use-error-handler'
import { toast } from 'sonner'

export function MenuItemDeleteDialog() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleErrorWithStatus } = useErrorHandler()
  const open = searchParams.get('delete') === 'item'
  const itemId = searchParams.get('id')

  // Fetch menu item data
  const { data: itemData } = useMenuItemQuery(itemId || null, open && !!itemId)
  const item = itemData?.data

  // Mutation
  const deleteMutation = useDeleteMenuItemMutation()

  const handleClose = () => {
    // Just close the dialog
    const params = new URLSearchParams(searchParams.toString())
    params.delete('delete')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Clean data after closing
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('id')
        router.push(`?${params.toString()}`, { scroll: false })
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [open])

  const handleDelete = async () => {
    if (!itemId) return

    try {
      await deleteMutation.mutateAsync(itemId)
      toast.success('Đã xóa món ăn thành công')
      handleClose()
    } catch (error) {
      handleErrorWithStatus(error, undefined, 'Không thể xóa món ăn')
    }
  }

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={handleClose}
      title="Xóa món"
      description="Hành động này không thể hoàn tác. Món ăn sẽ bị xóa vĩnh viễn khỏi menu."
      itemName={item?.name}
      onConfirm={handleDelete}
      isLoading={deleteMutation.isPending}
      confirmText="Xóa món ăn"
    />
  )
}
