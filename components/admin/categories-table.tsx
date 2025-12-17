"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GripVertical, MoreVertical, Pencil, Trash2, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
  description: string
  display_order: number
  is_active: boolean
  item_count: number
}

// Mock data
const mockCategories: Category[] = [
  {
    id: "1",
    name: "Khai vị",
    description: "Các món khai vị truyền thống",
    display_order: 1,
    is_active: true,
    item_count: 8,
  },
  {
    id: "2",
    name: "Món chính",
    description: "Các món chính phong phú",
    display_order: 2,
    is_active: true,
    item_count: 24,
  },
  {
    id: "3",
    name: "Tráng miệng",
    description: "Các món tráng miệng ngọt ngào",
    display_order: 3,
    is_active: true,
    item_count: 12,
  },
  {
    id: "4",
    name: "Đồ uống",
    description: "Nước giải khát và cocktail",
    display_order: 4,
    is_active: true,
    item_count: 18,
  },
  {
    id: "5",
    name: "Món đặc biệt",
    description: "Các món đặc biệt của nhà hàng",
    display_order: 5,
    is_active: false,
    item_count: 6,
  },
]

interface CategoriesTableProps {
  reorderMode: boolean
  setReorderMode: (value: boolean) => void
}

export function CategoriesTable({ reorderMode, setReorderMode }: CategoriesTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState(mockCategories)

  const handleEdit = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("modal", "category")
    params.set("mode", "edit")
    params.set("id", categoryId)
    router.push(`?${params.toString()}`)
  }

  const handleDelete = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("delete", "category")
    params.set("id", categoryId)
    router.push(`?${params.toString()}`)
  }

  const handleViewItems = (categoryId: string) => {
    router.push(`/admin/menu/items?categoryId=${categoryId}`)
  }

  const handleToggleActive = (categoryId: string) => {
    setCategories((prev) => prev.map((cat) => (cat.id === categoryId ? { ...cat, is_active: !cat.is_active } : cat)))
  }

  const handleSaveOrder = () => {
    // TODO: Save order to backend
    setReorderMode(false)
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {reorderMode && <TableHead className="w-[50px]"></TableHead>}
            <TableHead>Danh mục</TableHead>
            <TableHead className="w-[100px] text-center">Thứ tự</TableHead>
            <TableHead className="w-[120px] text-center">Trạng thái</TableHead>
            <TableHead className="w-[100px] text-center"># Món ăn</TableHead>
            <TableHead className="w-[80px] text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow
              key={category.id}
              className={cn(
                "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50",
                !category.is_active && "opacity-60",
              )}
              onClick={() => !reorderMode && handleViewItems(category.id)}
            >
              {reorderMode && (
                <TableCell>
                  <Button variant="ghost" size="icon" className="cursor-grab">
                    <GripVertical className="h-4 w-4 text-slate-400" />
                  </Button>
                </TableCell>
              )}
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-slate-900 dark:text-white">{category.name}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{category.description}</span>
                </div>
              </TableCell>
              <TableCell className="text-center text-slate-600 dark:text-slate-400">{category.display_order}</TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={category.is_active ? "default" : "secondary"}
                  className={cn(
                    "font-medium",
                    category.is_active
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                  )}
                >
                  {category.is_active ? "Active" : "Hidden"}
                </Badge>
              </TableCell>
              <TableCell className="text-center text-slate-600 dark:text-slate-400">{category.item_count}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(category.id)
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleActive(category.id)
                      }}
                    >
                      {category.is_active ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Ẩn danh mục
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Hiện danh mục
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(category.id)
                      }}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {reorderMode && (
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <Button variant="outline" onClick={() => setReorderMode(false)}>
            Hủy
          </Button>
          <Button onClick={handleSaveOrder} className="bg-emerald-600 hover:bg-emerald-700">
            Lưu thứ tự
          </Button>
        </div>
      )}
    </div>
  )
}
