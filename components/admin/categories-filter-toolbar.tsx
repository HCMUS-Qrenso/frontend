"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ArrowUpDown, Search } from "lucide-react"

interface CategoriesFilterToolbarProps {
  reorderMode: boolean
  setReorderMode: (value: boolean) => void
}

export function CategoriesFilterToolbar({ reorderMode, setReorderMode }: CategoriesFilterToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")

  const handleAddCategory = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("modal", "category")
    params.set("mode", "create")
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Search and Filters */}
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm theo tên danh mục..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang hiển thị</SelectItem>
              <SelectItem value="hidden">Đang ẩn</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select defaultValue="order">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="order">Theo thứ tự</SelectItem>
              <SelectItem value="updated">Mới cập nhật</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right: Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setReorderMode(!reorderMode)} className="gap-2">
            <ArrowUpDown className="h-4 w-4" />
            {reorderMode ? "Hủy sắp xếp" : "Sắp xếp"}
          </Button>
          <Button onClick={handleAddCategory} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Thêm danh mục
          </Button>
        </div>
      </div>
    </div>
  )
}
