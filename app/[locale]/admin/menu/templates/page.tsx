'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Template } from '@/src/features/admin/menu/types'
import { TemplateGallery } from '@/src/features/admin/menu/components/templates/template-gallery'
import { TemplateExport } from '@/src/features/admin/menu/components/templates/template-export'

function TemplatesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const templateId = searchParams.get('id')

  const templates: Template[] = [
    {
      id: '1',
      name: '2 Cột Tối Giản',
      thumbnail: '/menu-template/01.png',
      tags: ['A4', '2 Cột', 'Không Ảnh'],
      description: 'Thiết kế tối giản, 2 cột, phù hợp menu đơn giản',
      format: 'A4',
    },
    {
      id: '2',
      name: 'Menu Kèm Ảnh',
      thumbnail: '/menu-template/02.png',
      tags: ['A4', 'Có Ảnh', '1 Cột'],
      description: 'Ảnh món nổi bật, phong cách cao cấp',
      format: 'A4',
    },
    {
      id: '3',
      name: 'Đen Đơn Giản',
      thumbnail: '/menu-template/03.png',
      tags: ['A4', 'Dark', 'Vintage', 'Không Ảnh'],
      description: 'Phong cách bảng đen cổ điển, không cần ảnh',
      format: 'A4',
    },
    {
      id: '4',
      name: 'Gấp 3 Cổ Điển',
      thumbnail: '/menu-template/04.png',
      tags: ['Ngang', '3 Phần', 'A4', 'Không Ảnh'],
      description: 'Menu ngang A4 với 3 phần, gọn gàng cho nhà hàng nhỏ',
      format: 'A4',
    },
  ]

  if (templateId) {
    return (
      <div className="space-y-6">
        <TemplateExport selectedTemplate={templateId} templates={templates} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <TemplateGallery
        templates={templates}
        onSelectTemplate={(id: string) => {
          router.push(`/admin/menu/templates?id=${id}`)
        }}
      />
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
    </div>
  )
}

export default function MenuTemplatesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TemplatesContent />
    </Suspense>
  )
}
