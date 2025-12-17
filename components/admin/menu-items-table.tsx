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
import { MoreVertical, Pencil, Trash2, Award, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface MenuItem {
  id: string
  name: string
  category_id: string
  category_name: string
  description: string
  base_price: number
  preparation_time: number
  status: "available" | "unavailable" | "sold_out"
  is_chef_recommendation: boolean
  popularity_score: number
  image_url?: string
  updated_at: string
}

// Mock data
const mockMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Phở Bò Tái",
    category_id: "2",
    category_name: "Món chính",
    description: "Phở bò tái truyền thống Hà Nội",
    base_price: 85000,
    preparation_time: 15,
    status: "available",
    is_chef_recommendation: true,
    popularity_score: 95,
    image_url: "/pho-bo.jpg",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Bánh Xèo",
    category_id: "1",
    category_name: "Khai vị",
    description: "Bánh xèo giòn rụm với nhân tôm thịt",
    base_price: 65000,
    preparation_time: 20,
    status: "available",
    is_chef_recommendation: false,
    popularity_score: 78,
    image_url: "/banh-xeo.jpg",
    updated_at: "2024-01-14T15:20:00Z",
  },
  {
    id: "3",
    name: "Chả Cá Lã Vọng",
    category_id: "2",
    category_name: "Món chính",
    description: "Đặc sản Hà Nội với cá lăng chiên giòn",
    base_price: 125000,
    preparation_time: 25,
    status: "sold_out",
    is_chef_recommendation: true,
    popularity_score: 88,
    image_url: "/cha-ca.jpg",
    updated_at: "2024-01-15T08:45:00Z",
  },
  {
    id: "4",
    name: "Chè Ba Màu",
    category_id: "3",
    category_name: "Tráng miệng",
    description: "Chè truyền thống với đậu đỏ, đậu xanh và thạch",
    base_price: 35000,
    preparation_time: 5,
    status: "available",
    is_chef_recommendation: false,
    popularity_score: 72,
    image_url: "/che-ba-mau.jpg",
    updated_at: "2024-01-13T12:00:00Z",
  },
  {
    id: "5",
    name: "Cà Phê Sữa Đá",
    category_id: "4",
    category_name: "Đồ uống",
    description: "Cà phê phin truyền thống Việt Nam",
    base_price: 28000,
    preparation_time: 10,
    status: "available",
    is_chef_recommendation: false,
    popularity_score: 92,
    image_url: "/vietnamese-coffee.png",
    updated_at: "2024-01-15T09:15:00Z",
  },
  {
    id: "6",
    name: "Bún Chả Hà Nội",
    category_id: "2",
    category_name: "Món chính",
    description: "Bún chả với thịt nướng và nước chấm đặc biệt",
    base_price: 75000,
    preparation_time: 18,
    status: "unavailable",
    is_chef_recommendation: true,
    popularity_score: 91,
    image_url: "/bun-cha.jpg",
    updated_at: "2024-01-12T16:30:00Z",
  },
]

export function MenuItemsTable() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [menuItems] = useState(mockMenuItems)

  const handleEdit = (itemId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("modal", "item")
    params.set("mode", "edit")
    params.set("id", itemId)
    router.push(`?${params.toString()}`)
  }

  const handleDelete = (itemId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("delete", "item")
    params.set("id", itemId)
    router.push(`?${params.toString()}`)
  }

  const getStatusBadge = (status: MenuItem["status"]) => {
    const variants = {
      available: {
        label: "Đang bán",
        className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
      },
      sold_out: {
        label: "Hết hàng",
        className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      },
      unavailable: {
        label: "Tạm ẩn",
        className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
      },
    }

    const variant = variants[status]
    return (
      <Badge variant="secondary" className={cn("font-medium", variant.className)}>
        {variant.label}
      </Badge>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours}h trước`
    } else if (diffInHours < 48) {
      return "1 ngày trước"
    } else {
      return date.toLocaleDateString("vi-VN")
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Món ăn</TableHead>
                <TableHead className="w-[150px]">Danh mục</TableHead>
                <TableHead className="w-[120px] text-right">Giá</TableHead>
                <TableHead className="w-[120px] text-center">Trạng thái</TableHead>
                <TableHead className="w-[100px] text-center">Phổ biến</TableHead>
                <TableHead className="w-[120px]">Cập nhật</TableHead>
                <TableHead className="w-[80px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="text-slate-400">
                        <UtensilsCrossed className="mx-auto h-12 w-12" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Chưa có món ăn nào</p>
                        <p className="text-sm text-slate-500 dark:text-slate-500">
                          Bắt đầu bằng cách thêm món đầu tiên
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                menuItems.map((item) => (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                          {item.image_url ? (
                            <Image
                              src={item.image_url || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <UtensilsCrossed className="h-6 w-6 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
                            {item.is_chef_recommendation && (
                              <Award className="h-4 w-4 text-amber-500" title="Chef's recommendation" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span>{item.preparation_time} phút</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{item.category_name}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium text-slate-900 dark:text-white">{formatPrice(item.base_price)}</span>
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {item.popularity_score}
                        </span>
                        <span className="text-xs text-slate-500">/100</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{formatDate(item.updated_at)}</span>
                    </TableCell>
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
                              handleEdit(item.id)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(item.id)
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {menuItems.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-6 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Hiển thị 1–{menuItems.length} trên {menuItems.length} món
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Trước
            </Button>
            <Button variant="outline" size="sm" disabled>
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function UtensilsCrossed({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8" />
      <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7" />
      <path d="m2.1 21.8 6.4-6.3" />
      <path d="m19 5-7 7" />
    </svg>
  )
}
