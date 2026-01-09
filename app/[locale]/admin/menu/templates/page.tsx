'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Template } from '@/src/features/admin/menu/types'
import { TemplateGallery } from '@/src/features/admin/menu/components/templates/template-gallery'
import { TemplateExport } from '@/src/features/admin/menu/components/templates/template-export'
import { useTranslations } from 'next-intl'

function TemplatesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const templateId = searchParams.get('id')
  const t = useTranslations('menu.templates')

  const templates: Template[] = [
    {
      id: '1',
      name: t('items.template1Name'),
      thumbnail: '/menu-template/01.png',
      tags: [t('tags.a4'), t('tags.2col'), t('tags.noImage')],
      description: t('items.template1Desc'),
      format: 'A4',
    },
    {
      id: '2',
      name: t('items.template2Name'),
      thumbnail: '/menu-template/02.png',
      tags: [t('tags.a4'), t('tags.withImage'), t('tags.1col')],
      description: t('items.template2Desc'),
      format: 'A4',
    },
    {
      id: '3',
      name: t('items.template3Name'),
      thumbnail: '/menu-template/03.png',
      tags: [t('tags.a4'), t('tags.dark'), t('tags.vintage'), t('tags.noImage')],
      description: t('items.template3Desc'),
      format: 'A4',
    },
    {
      id: '4',
      name: t('items.template4Name'),
      thumbnail: '/menu-template/04.png',
      tags: [t('tags.horizontal'), t('tags.3parts'), t('tags.a4'), t('tags.noImage')],
      description: t('items.template4Desc'),
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

