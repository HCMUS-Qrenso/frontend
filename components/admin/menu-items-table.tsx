'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Award, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface MenuItem {
  id: string
  name: string
  category_id: string
  category_name: string
  description: string
  base_price: number
  preparation_time: number
  status: 'available' | 'unavailable' | 'sold_out'
  is_chef_recommendation: boolean
  popularity_score: number
  image_url?: string
  updated_at: string
}

// Mock data
const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Phở Bò Tái',
    category_id: '2',
    category_name: 'Món chính',
    description: 'Phở bò tái truyền thống Hà Nội',
    base_price: 85000,
    preparation_time: 15,
    status: 'available',
    is_chef_recommendation: true,
    popularity_score: 95,
    image_url: '/pho-bo.jpg',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Bánh Xèo',
    category_id: '1',
    category_name: 'Khai vị',
    description: 'Bánh xèo giòn rụm với nhân tôm thịt',
    base_price: 65000,
    preparation_time: 20,
    status: 'available',
    is_chef_recommendation: false,
    popularity_score: 78,
    image_url: '/banh-xeo.jpg',
    updated_at: '2024-01-14T15:20:00Z',
  },
  {
    id: '3',
    name: 'Chả Cá Lã Vọng',
    category_id: '2',
    category_name: 'Món chính',
    description: 'Đặc sản Hà Nội với cá lăng chiên giòn',
    base_price: 125000,
    preparation_time: 25,
    status: 'sold_out',
    is_chef_recommendation: true,
    popularity_score: 88,
    image_url: '/cha-ca.jpg',
    updated_at: '2024-01-15T08:45:00Z',
  },
  {
    id: '4',
    name: 'Chè Ba Màu',
    category_id: '3',
    category_name: 'Tráng miệng',
    description: 'Chè truyền thống với đậu đỏ, đậu xanh và thạch',
    base_price: 35000,
    preparation_time: 5,
    status: 'available',
    is_chef_recommendation: false,
    popularity_score: 72,
    image_url: '/che-ba-mau.jpg',
    updated_at: '2024-01-13T12:00:00Z',
  },
  {
    id: '5',
    name: 'Cà Phê Sữa Đá',
    category_id: '4',
    category_name: 'Đồ uống',
    description: 'Cà phê phin truyền thống Việt Nam',
    base_price: 28000,
    preparation_time: 10,
    status: 'available',
    is_chef_recommendation: false,
    popularity_score: 92,
    image_url: '/vietnamese-coffee.png',
    updated_at: '2024-01-15T09:15:00Z',
  },
  {
    id: '6',
    name: 'Bún Chả Hà Nội',
    category_id: '2',
    category_name: 'Món chính',
    description: 'Bún chả với thịt nướng và nước chấm đặc biệt',
    base_price: 75000,
    preparation_time: 18,
    status: 'unavailable',
    is_chef_recommendation: true,
    popularity_score: 91,
    image_url: '/bun-cha.jpg',
    updated_at: '2024-01-12T16:30:00Z',
  },
  {
    id: '7',
    name: 'Nem Nướng Nha Trang',
    category_id: '1',
    category_name: 'Khai vị',
    description: 'Nem nướng thơm ngon đặc sản Nha Trang',
    base_price: 55000,
    preparation_time: 12,
    status: 'available',
    is_chef_recommendation: false,
    popularity_score: 85,
    image_url: '/nem-nuong.jpg',
    updated_at: '2024-01-15T11:20:00Z',
  },
  {
    id: '8',
    name: 'Bánh Mì Thịt Nướng',
    category_id: '2',
    category_name: 'Món chính',
    description: 'Bánh mì Việt Nam với thịt nướng và pate',
    base_price: 45000,
    preparation_time: 8,
    status: 'available',
    is_chef_recommendation: false,
    popularity_score: 89,
    image_url: '/banh-mi.jpg',
    updated_at: '2024-01-15T07:00:00Z',
  },
  {
    id: '9',
    name: 'Gỏi Cuốn',
    category_id: '1',
    category_name: 'Khai vị',
    description: 'Gỏi cuốn tôm thịt tươi ngon',
    base_price: 40000,
    preparation_time: 10,
    status: 'available',
    is_chef_recommendation: false,
    popularity_score: 80,
    image_url: '/goi-cuon.jpg',
    updated_at: '2024-01-14T14:15:00Z',
  },
  {
    id: '10',
    name: 'Bánh Flan',
    category_id: '3',
    category_name: 'Tráng miệng',
    description: 'Bánh flan caramen mềm mịn',
    base_price: 30000,
    preparation_time: 5,
    status: 'available',
    is_chef_recommendation: false,
    popularity_score: 75,
    image_url: '/banh-flan.jpg',
    updated_at: '2024-01-13T10:30:00Z',
  },
  {
    id: '11',
    name: 'Cơm Tấm Sài Gòn',
    category_id: '2',
    category_name: 'Món chính',
    description: 'Cơm tấm với sườn nướng và trứng ốp la',
    base_price: 70000,
    preparation_time: 15,
    status: 'sold_out',
    is_chef_recommendation: true,
    popularity_score: 93,
    image_url: '/com-tam.jpg',
    updated_at: '2024-01-15T12:00:00Z',
  },
  {
    id: '12',
    name: 'Sinh Tố Bơ',
    category_id: '4',
    category_name: 'Đồ uống',
    description: 'Sinh tố bơ thơm ngậy',
    base_price: 45000,
    preparation_time: 5,
    status: 'available',
    is_chef_recommendation: false,
    popularity_score: 82,
    image_url: '/sinh-to-bo.jpg',
    updated_at: '2024-01-14T09:45:00Z',
  },
  {
    id: '13',
    name: 'Chả Giò',
    category_id: '1',
    category_name: 'Khai vị',
    description: 'Chả giò giòn rụm với nhân thịt',
    base_price: 50000,
    preparation_time: 12,
    status: 'available',
    is_chef_recommendation: false,
    popularity_score: 77,
    image_url: '/cha-gio.jpg',
    updated_at: '2024-01-14T16:20:00Z',
  },
  {
    id: '14',
    name: 'Bún Bò Huế',
    category_id: '2',
    category_name: 'Món chính',
    description: 'Bún bò Huế cay nồng đậm đà',
    base_price: 80000,
    preparation_time: 20,
    status: 'available',
    is_chef_recommendation: true,
    popularity_score: 90,
    image_url: '/bun-bo-hue.jpg',
    updated_at: '2024-01-15T08:30:00Z',
  },
  {
    id: '15',
    name: 'Chè Thái',
    category_id: '3',
    category_name: 'Tráng miệng',
    description: 'Chè Thái ngọt mát với nhiều loại trái cây',
    base_price: 40000,
    preparation_time: 5,
    status: 'available',
    is_chef_recommendation: false,
    popularity_score: 79,
    image_url: '/che-thai.jpg',
    updated_at: '2024-01-13T15:00:00Z',
  },
  {
    id: '16',
    name: 'Trà Đào Cam Sả',
    category_id: '4',
    category_name: 'Đồ uống',
    description: 'Trà đào cam sả mát lạnh',
    base_price: 35000,
    preparation_time: 5,
    status: 'available',
    is_chef_recommendation: false,
    popularity_score: 88,
    image_url: '/tra-dao.jpg',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '17',
    name: 'Bánh Cuốn',
    category_id: '1',
    category_name: 'Khai vị',
    description: 'Bánh cuốn nóng với nhân thịt và nước mắm',
    base_price: 50000,
    preparation_time: 10,
    status: 'unavailable',
    is_chef_recommendation: false,
    popularity_score: 73,
    image_url: '/banh-cuon.jpg',
    updated_at: '2024-01-11T08:00:00Z',
  },
  {
    id: '18',
    name: 'Cá Kho Tộ',
    category_id: '2',
    category_name: 'Món chính',
    description: 'Cá kho tộ đậm đà vị miền Tây',
    base_price: 95000,
    preparation_time: 30,
    status: 'available',
    is_chef_recommendation: true,
    popularity_score: 87,
    image_url: '/ca-kho-to.jpg',
    updated_at: '2024-01-14T18:00:00Z',
  },
  {
    id: '19',
    name: 'Kem Dừa',
    category_id: '3',
    category_name: 'Tráng miệng',
    description: 'Kem dừa mát lạnh thơm ngon',
    base_price: 32000,
    preparation_time: 3,
    status: 'available',
    is_chef_recommendation: false,
    popularity_score: 76,
    image_url: '/kem-dua.jpg',
    updated_at: '2024-01-13T11:30:00Z',
  },
  {
    id: '20',
    name: 'Nước Dừa Tươi',
    category_id: '4',
    category_name: 'Đồ uống',
    description: 'Nước dừa tươi mát lạnh',
    base_price: 25000,
    preparation_time: 2,
    status: 'available',
    is_chef_recommendation: false,
    popularity_score: 81,
    image_url: '/nuoc-dua.jpg',
    updated_at: '2024-01-15T09:00:00Z',
  },
  {
    id: '21',
    name: 'Bánh Khọt',
    category_id: '1',
    category_name: 'Khai vị',
    description: 'Bánh khọt giòn thơm Vũng Tàu',
    base_price: 60000,
    preparation_time: 15,
    status: 'available',
    is_chef_recommendation: false,
    popularity_score: 84,
    image_url: '/banh-khot.jpg',
    updated_at: '2024-01-14T12:00:00Z',
  },
  {
    id: '22',
    name: 'Hủ Tiếu Nam Vang',
    category_id: '2',
    category_name: 'Món chính',
    description: 'Hủ tiếu Nam Vang với nước dùng trong',
    base_price: 65000,
    preparation_time: 15,
    status: 'sold_out',
    is_chef_recommendation: false,
    popularity_score: 86,
    image_url: '/hu-tieu.jpg',
    updated_at: '2024-01-15T13:00:00Z',
  },
  {
    id: '23',
    name: 'Chè Chuối',
    category_id: '3',
    category_name: 'Tráng miệng',
    description: 'Chè chuối nước cốt dừa thơm béo',
    base_price: 28000,
    preparation_time: 8,
    status: 'available',
    is_chef_recommendation: false,
    popularity_score: 70,
    image_url: '/che-chuoi.jpg',
    updated_at: '2024-01-12T14:00:00Z',
  },
  {
    id: '24',
    name: 'Sữa Chua Nếp Cẩm',
    category_id: '3',
    category_name: 'Tráng miệng',
    description: 'Sữa chua với nếp cẩm giòn dai',
    base_price: 35000,
    preparation_time: 5,
    status: 'available',
    is_chef_recommendation: true,
    popularity_score: 94,
    image_url: '/sua-chua-nep-cam.jpg',
    updated_at: '2024-01-15T11:00:00Z',
  },
  {
    id: '25',
    name: 'Trà Sữa Trân Châu',
    category_id: '4',
    category_name: 'Đồ uống',
    description: 'Trà sữa trân châu đen thơm ngon',
    base_price: 40000,
    preparation_time: 5,
    status: 'available',
    is_chef_recommendation: false,
    popularity_score: 96,
    image_url: '/tra-sua.jpg',
    updated_at: '2024-01-15T14:00:00Z',
  },
  {
    id: '26',
    name: 'Bánh Tráng Trộn',
    category_id: '1',
    category_name: 'Khai vị',
    description: 'Bánh tráng trộn với đầy đủ topping',
    base_price: 35000,
    preparation_time: 8,
    status: 'available',
    is_chef_recommendation: false,
    popularity_score: 83,
    image_url: '/banh-trang-tron.jpg',
    updated_at: '2024-01-14T17:00:00Z',
  },
  {
    id: '27',
    name: 'Cơm Gà Hội An',
    category_id: '2',
    category_name: 'Món chính',
    description: 'Cơm gà Hội An thơm ngon đặc sản',
    base_price: 75000,
    preparation_time: 20,
    status: 'available',
    is_chef_recommendation: true,
    popularity_score: 92,
    image_url: '/com-ga-hoi-an.jpg',
    updated_at: '2024-01-15T12:30:00Z',
  },
  {
    id: '28',
    name: 'Bánh Đúc Nóng',
    category_id: '1',
    category_name: 'Khai vị',
    description: 'Bánh đúc nóng với tôm khô và hành phi',
    base_price: 40000,
    preparation_time: 10,
    status: 'unavailable',
    is_chef_recommendation: false,
    popularity_score: 68,
    image_url: '/banh-duc.jpg',
    updated_at: '2024-01-10T10:00:00Z',
  },
  {
    id: '29',
    name: 'Nước Sâm',
    category_id: '4',
    category_name: 'Đồ uống',
    description: 'Nước sâm thanh mát giải nhiệt',
    base_price: 30000,
    preparation_time: 3,
    status: 'available',
    is_chef_recommendation: false,
    popularity_score: 74,
    image_url: '/nuoc-sam.jpg',
    updated_at: '2024-01-13T16:00:00Z',
  },
  {
    id: '30',
    name: 'Bánh Pía',
    category_id: '3',
    category_name: 'Tráng miệng',
    description: 'Bánh pía Sóc Trăng thơm ngọt',
    base_price: 45000,
    preparation_time: 5,
    status: 'available',
    is_chef_recommendation: false,
    popularity_score: 71,
    image_url: '/banh-pia.jpg',
    updated_at: '2024-01-12T11:00:00Z',
  },
]

export function MenuItemsTable() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [menuItems] = useState(mockMenuItems)

  // Pagination logic
  const limit = Number.parseInt(searchParams.get('limit') || '10')
  const currentPage = Number.parseInt(searchParams.get('page') || '1')
  const total = menuItems.length
  const totalPages = Math.ceil(total / limit)
  const startItem = (currentPage - 1) * limit + 1
  const endItem = Math.min(currentPage * limit, total)

  // Display only items for current page
  const displayedItems = menuItems.slice((currentPage - 1) * limit, currentPage * limit)

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/admin/menu/items?${params.toString()}`)
  }

  const handleEdit = (itemId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('modal', 'item')
    params.set('mode', 'edit')
    params.set('id', itemId)
    router.push(`/admin/menu/items?${params.toString()}`)
  }

  const handleDelete = (itemId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('delete', 'item')
    params.set('id', itemId)
    router.push(`/admin/menu/items?${params.toString()}`)
  }

  const getStatusBadge = (status: MenuItem['status']) => {
    const variants = {
      available: {
        label: 'Đang bán',
        className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
      },
      sold_out: {
        label: 'Hết hàng',
        className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
      },
      unavailable: {
        label: 'Tạm ẩn',
        className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      },
    }

    const variant = variants[status]
    return (
      <Badge variant="secondary" className={cn('font-medium', variant.className)}>
        {variant.label}
      </Badge>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours}h trước`
    } else if (diffInHours < 48) {
      return '1 ngày trước'
    } else {
      return date.toLocaleDateString('vi-VN')
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50/80 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900">
              <TableHead className="w-[300px] px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Món ăn
              </TableHead>
              <TableHead className="w-[150px] px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Danh mục
              </TableHead>
              <TableHead className="w-[120px] px-6 py-3 text-right text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Giá
              </TableHead>
              <TableHead className="w-[120px] px-6 py-3 text-center text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Trạng thái
              </TableHead>
              <TableHead className="w-[100px] px-6 py-3 text-center text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Phổ biến
              </TableHead>
              <TableHead className="w-[120px] px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Cập nhật
              </TableHead>
              <TableHead className="w-[100px] px-6 py-3 text-right text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="text-slate-400">
                      <UtensilsCrossed className="mx-auto h-12 w-12" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Chưa có món ăn nào
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-500">
                        Bắt đầu bằng cách thêm món đầu tiên
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              displayedItems.map((item, index) => (
                <TableRow
                  key={item.id}
                  className={cn(
                    'border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800',
                    index === displayedItems.length - 1 && 'border-b-0',
                  )}
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                        {item.image_url ? (
                          <Image
                            src={item.image_url || '/placeholder.svg'}
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
                          <span className="font-medium text-slate-900 dark:text-white">
                            {item.name}
                          </span>
                          {item.is_chef_recommendation && (
                            <span title="Chef's recommendation">
                              <Award className="h-4 w-4 text-amber-500" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>{item.preparation_time} phút</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {item.category_name}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <span className="font-medium text-slate-900 dark:text-white">
                      {formatPrice(item.base_price)}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    {getStatusBadge(item.status)}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {item.popularity_score}
                      </span>
                      <span className="text-xs text-slate-500">/100</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(item.updated_at)}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(item.id)
                        }}
                        title="Chỉnh sửa"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item.id)
                        }}
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hiển thị {startItem}-{endItem} trên {total} món
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-transparent"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Trước
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant="outline"
                size="sm"
                className={cn(
                  'h-8 w-8 rounded-full',
                  pageNum === currentPage
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                    : 'bg-transparent',
                )}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-transparent"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
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
