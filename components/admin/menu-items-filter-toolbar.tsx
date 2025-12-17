"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function MenuItemsFilterToolbar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")

  const handleCreateItem = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("modal", "item")
    params.set("mode", "create")
    router.push(`?${params.toString()}`)
  }

  const handleImportExport = () => {
    router.push("/admin/menu/import-export")
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo tên món..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            <SelectItem value="appetizers">Khai vị</SelectItem>
            <SelectItem value="main">Món chính</SelectItem>
            <SelectItem value="desserts">Tráng miệng</SelectItem>
            <SelectItem value="drinks">Đồ uống</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="available">Đang bán</SelectItem>
            <SelectItem value="sold_out">Hết hàng</SelectItem>
            <SelectItem value="unavailable">Tạm ẩn</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select defaultValue="updated">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Mới cập nhật</SelectItem>
            <SelectItem value="popularity">Phổ biến</SelectItem>
            <SelectItem value="price_asc">Giá tăng dần</SelectItem>
            <SelectItem value="price_desc">Giá giảm dần</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleImportExport}>
          <Download className="mr-2 h-4 w-4" />
          Import/Export
        </Button>
        <Button onClick={handleCreateItem} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Thêm món
        </Button>
      </div>
    </div>
  )
}
