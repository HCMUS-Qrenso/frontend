"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Loader2 } from "lucide-react"

export function CategoryDeleteDialog() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isDeleting, setIsDeleting] = useState(false)

  const open = searchParams.get("delete") === "category"
  const categoryId = searchParams.get("id")

  // Mock: Check if category has items
  const hasItems = true
  const itemCount = 8

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("delete")
    params.delete("id")
    router.push(`?${params.toString()}`)
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      // TODO: Delete category
      await new Promise((resolve) => setTimeout(resolve, 1000))

      handleClose()
    } catch (error) {
      console.error("Error deleting category:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa danh mục?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Danh mục sẽ bị xóa vĩnh viễn khỏi hệ thống.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {hasItems && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Danh mục đang chứa {itemCount} món ăn. Bạn cần chuyển các món sang danh mục khác trước khi xóa.
            </AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting || hasItems}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Xóa danh mục"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
