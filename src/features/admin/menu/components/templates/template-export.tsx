'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, Eye, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCategoriesQuery, useMenuItemsQuery } from '../../queries'
import { useCurrentTenantQuery } from '../../../tenants/queries/tenants.queries'
import type { MenuItem, Template } from '../../types'
import { generatePDFBlob } from './utils'
import { useRouter } from 'next/navigation'
import { ContainerLoadingState, ContainerErrorState } from '@/components/ui/loading-state'

interface TemplateExportProps {
  templates: Template[]
  selectedTemplate?: string
}

export function TemplateExport({ templates, selectedTemplate }: TemplateExportProps) {
  const [zoom, setZoom] = useState(75)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [isMouseOverCanvas, setIsMouseOverCanvas] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Global wheel event handler to prevent page scroll when over canvas
  useEffect(() => {
    const handleGlobalWheel = (e: WheelEvent) => {
      if (isMouseOverCanvas && canvasRef.current?.contains(e.target as Node)) {
        e.preventDefault()
        e.stopImmediatePropagation()
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
        const newZoom = Math.max(25, Math.min(300, zoom * zoomFactor))
        setZoom(newZoom)
        return false
      }
    }

    if (isMouseOverCanvas) {
      document.addEventListener('wheel', handleGlobalWheel, { passive: false, capture: true })
    }

    return () => {
      document.removeEventListener('wheel', handleGlobalWheel, true)
    }
  }, [isMouseOverCanvas, zoom])

  const [accentColor, setAccentColor] = useState('emerald')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'Nhà hàng Việt',
    address: '123 Nguyễn Huệ, Q.1, TP.HCM',
    phone: '028 1234 5678',
  })
  const [displayOptions, setDisplayOptions] = useState({
    showPrices: true,
    showDescriptions: true,
    showChefRecommendations: true,
  })
  const [chefIcon, setChefIcon] = useState('⭐')
  const [isExporting, setIsExporting] = useState(false)
  const [activeTab, setActiveTab] = useState<'data' | 'style'>('data')
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')

  // Fetch data
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategoriesQuery({ status: 'active' })
  const {
    data: menuItemsData,
    isLoading: menuItemsLoading,
    isError: menuItemsError,
  } = useMenuItemsQuery({
    status: 'available',
    limit: 100,
  })
  const {
    data: tenantData,
    isLoading: tenantLoading,
    isError: tenantError,
  } = useCurrentTenantQuery()

  // Initialize restaurant info from current tenant
  useEffect(() => {
    if (tenantData?.data) {
      const tenant = tenantData.data
      setRestaurantInfo({
        name: tenant.name,
        address: tenant.address || '',
        phone: (tenant.settings as any)?.phone || '028 1234 5678', // fallback if not in settings
      })
    }
  }, [tenantData])

  const categories = categoriesData?.data.categories || []
  const menuItems = menuItemsData?.data.menu_items || []

  // Auto-select all categories by default
  useEffect(() => {
    if (categories.length > 0) {
      setSelectedCategories(new Set(categories.map((cat) => cat.id)))
    }
  }, [categories])

  // Pan and zoom handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - lastMousePos.x
    const deltaY = e.clientY - lastMousePos.y

    setPanX((prev) => prev + deltaX)
    setPanY((prev) => prev + deltaY)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(25, Math.min(300, zoom * zoomFactor))
    setZoom(newZoom)
  }

  const resetView = () => {
    setZoom(75)
    setPanX(0)
    setPanY(0)
  }

  const handleChangeTemplate = (templateId: string) => {
    router.push(`/admin/menu/templates?id=${templateId}`)
  }

  // Helper function to render menu content for preview
  const renderMenuContent = () => {
    const fontSizeClasses = {
      small: 'text-xs',
      medium: 'text-sm',
      large: 'text-base',
    }
    const titleSizeClasses = {
      small: 'text-xl',
      medium: 'text-2xl',
      large: 'text-3xl',
    }

    const effectiveTheme = theme

    // Define accent color classes for preview (matching PDF logic)
    const accentColorClasses = {
      emerald: effectiveTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400',
      blue: effectiveTheme === 'light' ? 'text-blue-600' : 'text-blue-400',
      amber: effectiveTheme === 'light' ? 'text-amber-600' : 'text-amber-400',
      rose: effectiveTheme === 'light' ? 'text-rose-600' : 'text-rose-400',
    }
    const categoryAccentClass = accentColorClasses[accentColor as keyof typeof accentColorClasses]

    // Calculate approximate items per page based on template
    const getMaxItemsPerPage = (templateId: string) => {
      switch (templateId) {
        case '1':
          return 16 // 2 columns, ~8 per column
        case '2':
          return 8 // Photo-forward, larger items
        case '3':
          return 20 // Simple layout
        case '4':
          return Infinity // Already paginated by categories
        default:
          return 15
      }
    }

    const maxItemsPerPage = getMaxItemsPerPage(selectedTemplate || '')

    // Flatten all items for pagination
    const allItems = Object.entries(menuItemsByCategory).flatMap(([categoryId, items]) =>
      items.map((item) => ({ ...item, categoryId })),
    )

    // Template-specific preview rendering - matching PDF logic exactly
    if (selectedTemplate === '1') {
      // Minimal A4 2-Column - add pagination if too many items
      const totalItems = allItems.length
      if (totalItems > maxItemsPerPage) {
        // Create multiple pages
        const pages = []
        const itemsPerPage = Math.ceil(totalItems / Math.ceil(totalItems / maxItemsPerPage))

        for (let pageIndex = 0; pageIndex < Math.ceil(totalItems / itemsPerPage); pageIndex++) {
          const startItem = pageIndex * itemsPerPage
          const endItem = startItem + itemsPerPage
          const pageItems = allItems.slice(startItem, endItem)

          // Group by category for this page
          const pageCategories = pageItems.reduce(
            (acc, item) => {
              if (!acc[item.categoryId]) acc[item.categoryId] = []
              acc[item.categoryId].push(item)
              return acc
            },
            {} as Record<string, any[]>,
          )

          pages.push(
            <div
              key={pageIndex}
              className={cn(
                'flex h-full p-8',
                fontSizeClasses[fontSize],
                effectiveTheme === 'light'
                  ? 'bg-white text-slate-900'
                  : 'bg-slate-800 text-slate-100',
              )}
            >
              {pageIndex === 0 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 transform text-center">
                  <h1
                    className={cn(
                      titleSizeClasses[fontSize],
                      'font-bold',
                      effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                    )}
                  >
                    {restaurantInfo.name}
                  </h1>
                  <p className={effectiveTheme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                    {restaurantInfo.address} • {restaurantInfo.phone}
                  </p>
                </div>
              )}
              <div className="mt-16 flex-1 pr-4">
                {Object.entries(pageCategories)
                  .slice(0, Math.ceil(Object.keys(pageCategories).length / 2))
                  .map(([categoryId, items]) => {
                    const category = categories.find((c) => c.id === categoryId)
                    if (!category) return null
                    return (
                      <div key={categoryId} className="mb-4">
                        <h2
                          className={cn(
                            'mb-2 border-b pb-1 font-bold',
                            effectiveTheme === 'light' ? 'border-slate-200' : 'border-slate-600',
                            categoryAccentClass,
                          )}
                        >
                          {category.name}
                        </h2>
                        <div className="space-y-1">
                          {items.map((item) => (
                            <div key={item.id} className="flex justify-between">
                              <div className="flex-1">
                                <span
                                  className={cn(
                                    'font-medium',
                                    effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                                  )}
                                >
                                  {item.name}
                                  {displayOptions.showChefRecommendations &&
                                    item.is_chef_recommendation && (
                                      <span className="ml-1 text-amber-500">{chefIcon}</span>
                                    )}
                                </span>
                                {displayOptions.showDescriptions && item.description && (
                                  <p
                                    className={cn(
                                      'mt-1',
                                      effectiveTheme === 'light'
                                        ? 'text-slate-500'
                                        : 'text-slate-400',
                                    )}
                                  >
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              {displayOptions.showPrices && (
                                <span
                                  className={cn(
                                    'ml-2 font-semibold',
                                    effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                                  )}
                                >
                                  {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}
                                  đ
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
              </div>
              <div className="mt-16 flex-1 pl-4">
                {Object.entries(pageCategories)
                  .slice(Math.ceil(Object.keys(pageCategories).length / 2))
                  .map(([categoryId, items]) => {
                    const category = categories.find((c) => c.id === categoryId)
                    if (!category) return null
                    return (
                      <div key={categoryId} className="mb-4">
                        <h2
                          className={cn(
                            'mb-2 border-b pb-1 font-bold',
                            effectiveTheme === 'light' ? 'border-slate-200' : 'border-slate-600',
                            categoryAccentClass,
                          )}
                        >
                          {category.name}
                        </h2>
                        <div className="space-y-1">
                          {items.map((item) => (
                            <div key={item.id} className="flex justify-between">
                              <div className="flex-1">
                                <span
                                  className={cn(
                                    'font-medium',
                                    effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                                  )}
                                >
                                  {item.name}
                                  {displayOptions.showChefRecommendations &&
                                    item.is_chef_recommendation && (
                                      <span className="ml-1 text-amber-500">{chefIcon}</span>
                                    )}
                                </span>
                                {displayOptions.showDescriptions && item.description && (
                                  <p
                                    className={cn(
                                      'mt-1',
                                      effectiveTheme === 'light'
                                        ? 'text-slate-500'
                                        : 'text-slate-400',
                                    )}
                                  >
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              {displayOptions.showPrices && (
                                <span
                                  className={cn(
                                    'ml-2 font-semibold',
                                    effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                                  )}
                                >
                                  {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}
                                  đ
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>,
          )
        }
        return pages
      } else {
        // Single page - original logic
        return (
          <div
            className={cn(
              'flex h-full p-8',
              fontSizeClasses[fontSize],
              effectiveTheme === 'light'
                ? 'bg-white text-slate-900'
                : 'bg-slate-800 text-slate-100',
            )}
          >
            <div className="absolute top-4 left-1/2 -translate-x-1/2 transform text-center">
              <h1
                className={cn(
                  titleSizeClasses[fontSize],
                  'font-bold',
                  effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                )}
              >
                {restaurantInfo.name}
              </h1>
              <p className={effectiveTheme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                {restaurantInfo.address} • {restaurantInfo.phone}
              </p>
            </div>
            <div className="mt-16 flex-1 pr-4">
              {Object.entries(menuItemsByCategory)
                .slice(0, Math.ceil(Object.keys(menuItemsByCategory).length / 2))
                .map(([categoryId, items]) => {
                  const category = categories.find((c) => c.id === categoryId)
                  if (!category) return null
                  return (
                    <div key={categoryId} className="mb-4">
                      <h2
                        className={cn(
                          'mb-2 border-b pb-1 font-bold',
                          effectiveTheme === 'light' ? 'border-slate-200' : 'border-slate-600',
                          categoryAccentClass,
                        )}
                      >
                        {category.name}
                      </h2>
                      <div className="space-y-1">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <div className="flex-1">
                              <span
                                className={cn(
                                  'font-medium',
                                  effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                                )}
                              >
                                {item.name}
                                {displayOptions.showChefRecommendations &&
                                  item.is_chef_recommendation && (
                                    <span className="ml-1 text-amber-500">{chefIcon}</span>
                                  )}
                              </span>
                              {displayOptions.showDescriptions && item.description && (
                                <p
                                  className={cn(
                                    'mt-1',
                                    effectiveTheme === 'light'
                                      ? 'text-slate-500'
                                      : 'text-slate-400',
                                  )}
                                >
                                  {item.description}
                                </p>
                              )}
                            </div>
                            {displayOptions.showPrices && (
                              <span
                                className={cn(
                                  'ml-2 font-semibold',
                                  effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                                )}
                              >
                                {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>
            <div className="mt-16 flex-1 pl-4">
              {Object.entries(menuItemsByCategory)
                .slice(Math.ceil(Object.keys(menuItemsByCategory).length / 2))
                .map(([categoryId, items]) => {
                  const category = categories.find((c) => c.id === categoryId)
                  if (!category) return null
                  return (
                    <div key={categoryId} className="mb-4">
                      <h2
                        className={cn(
                          'mb-2 border-b pb-1 font-bold',
                          effectiveTheme === 'light' ? 'border-slate-200' : 'border-slate-600',
                          categoryAccentClass,
                        )}
                      >
                        {category.name}
                      </h2>
                      <div className="space-y-1">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <div className="flex-1">
                              <span
                                className={cn(
                                  'font-medium',
                                  effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                                )}
                              >
                                {item.name}
                                {displayOptions.showChefRecommendations &&
                                  item.is_chef_recommendation && (
                                    <span className="ml-1 text-amber-500">{chefIcon}</span>
                                  )}
                              </span>
                              {displayOptions.showDescriptions && item.description && (
                                <p
                                  className={cn(
                                    'mt-1',
                                    effectiveTheme === 'light'
                                      ? 'text-slate-500'
                                      : 'text-slate-400',
                                  )}
                                >
                                  {item.description}
                                </p>
                              )}
                            </div>
                            {displayOptions.showPrices && (
                              <span
                                className={cn(
                                  'ml-2 font-semibold',
                                  effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                                )}
                              >
                                {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )
      }
    } else if (selectedTemplate === '2') {
      // Photo-Forward Premium - add pagination if too many items
      const totalItems = allItems.length
      if (totalItems > maxItemsPerPage) {
        // Create multiple pages
        const pages = []
        const itemsPerPage = Math.ceil(totalItems / Math.ceil(totalItems / maxItemsPerPage))

        for (let pageIndex = 0; pageIndex < Math.ceil(totalItems / itemsPerPage); pageIndex++) {
          const startItem = pageIndex * itemsPerPage
          const endItem = startItem + itemsPerPage
          const pageItems = allItems.slice(startItem, endItem)

          // Group by category for this page
          const pageCategories = pageItems.reduce(
            (acc, item) => {
              if (!acc[item.categoryId]) acc[item.categoryId] = []
              acc[item.categoryId].push(item)
              return acc
            },
            {} as Record<string, any[]>,
          )

          pages.push(
            <div
              key={pageIndex}
              className={cn(
                'flex h-full flex-col p-8',
                fontSizeClasses[fontSize],
                effectiveTheme === 'light'
                  ? 'bg-slate-50 text-slate-900'
                  : 'bg-slate-900 text-slate-100',
              )}
            >
              {pageIndex === 0 && (
                <div className="mb-8 text-center">
                  <h1
                    className={cn(
                      titleSizeClasses[fontSize],
                      'font-bold',
                      effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                    )}
                  >
                    {restaurantInfo.name}
                  </h1>
                  <p className={effectiveTheme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                    {restaurantInfo.address} • {restaurantInfo.phone}
                  </p>
                </div>
              )}
              <div className="flex-1 space-y-6">
                {Object.entries(pageCategories).map(([categoryId, items]) => {
                  const category = categories.find((c) => c.id === categoryId)
                  if (!category) return null
                  return (
                    <div key={categoryId}>
                      <h2
                        className={cn(
                          'mb-3 border-b-2 pb-2 text-lg font-bold',
                          effectiveTheme === 'light' ? 'border-slate-300' : 'border-slate-600',
                          categoryAccentClass,
                        )}
                      >
                        {category.name}
                      </h2>
                      <div className="grid grid-cols-1 gap-4">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              'flex gap-4 rounded-lg border p-4',
                              effectiveTheme === 'light'
                                ? 'border-slate-200 bg-white'
                                : 'border-slate-700 bg-slate-800',
                            )}
                          >
                            {item.images && item.images.length > 0 && (
                              <div className="h-20 w-20 shrink-0">
                                <img
                                  src={
                                    item.images.find((img: any) => img.is_primary)?.image_url ||
                                    item.images[0]?.image_url ||
                                    '/placeholder.jpg'
                                  }
                                  alt={item.name}
                                  className="h-full w-full rounded-md object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <span
                                    className={cn(
                                      'text-lg font-semibold',
                                      effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                                    )}
                                  >
                                    {item.name}
                                    {displayOptions.showChefRecommendations &&
                                      item.is_chef_recommendation && (
                                        <span className="ml-2 text-amber-500">{chefIcon}</span>
                                      )}
                                  </span>
                                  {displayOptions.showDescriptions && item.description && (
                                    <p
                                      className={cn(
                                        'mt-2',
                                        effectiveTheme === 'light'
                                          ? 'text-slate-600'
                                          : 'text-slate-300',
                                      )}
                                    >
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                {displayOptions.showPrices && (
                                  <span
                                    className={cn(
                                      'ml-4 text-lg font-bold',
                                      effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                                    )}
                                  >
                                    {new Intl.NumberFormat('vi-VN').format(
                                      parseInt(item.base_price),
                                    )}
                                    đ
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>,
          )
        }
        return pages
      } else {
        // Single page - original logic
        return (
          <div
            className={cn(
              'flex h-full flex-col p-8',
              fontSizeClasses[fontSize],
              effectiveTheme === 'light'
                ? 'bg-slate-50 text-slate-900'
                : 'bg-slate-900 text-slate-100',
            )}
          >
            <div className="mb-8 text-center">
              <h1
                className={cn(
                  titleSizeClasses[fontSize],
                  'font-bold',
                  effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                )}
              >
                {restaurantInfo.name}
              </h1>
              <p className={effectiveTheme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                {restaurantInfo.address} • {restaurantInfo.phone}
              </p>
            </div>
            <div className="flex-1 space-y-6">
              {Object.entries(menuItemsByCategory).map(([categoryId, items]) => {
                const category = categories.find((c) => c.id === categoryId)
                if (!category) return null
                return (
                  <div key={categoryId}>
                    <h2
                      className={cn(
                        'mb-3 border-b-2 pb-2 text-lg font-bold',
                        effectiveTheme === 'light' ? 'border-slate-300' : 'border-slate-600',
                        categoryAccentClass,
                      )}
                    >
                      {category.name}
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            'flex gap-4 rounded-lg border p-4',
                            effectiveTheme === 'light'
                              ? 'border-slate-200 bg-white'
                              : 'border-slate-700 bg-slate-800',
                          )}
                        >
                          {item.images && item.images.length > 0 && (
                            <div className="h-20 w-20 shrink-0">
                              <img
                                src={
                                  item.images.find((img: any) => img.is_primary)?.image_url ||
                                  item.images[0]?.image_url ||
                                  '/placeholder.jpg'
                                }
                                alt={item.name}
                                className="h-full w-full rounded-md object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <span
                                  className={cn(
                                    'text-lg font-semibold',
                                    effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                                  )}
                                >
                                  {item.name}
                                  {displayOptions.showChefRecommendations &&
                                    item.is_chef_recommendation && (
                                      <span className="ml-2 text-amber-500">{chefIcon}</span>
                                    )}
                                </span>
                                {displayOptions.showDescriptions && item.description && (
                                  <p
                                    className={cn(
                                      'mt-2',
                                      effectiveTheme === 'light'
                                        ? 'text-slate-600'
                                        : 'text-slate-300',
                                    )}
                                  >
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              {displayOptions.showPrices && (
                                <span
                                  className={cn(
                                    'ml-4 text-lg font-bold',
                                    effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                                  )}
                                >
                                  {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}
                                  đ
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      }
    } else if (selectedTemplate === '3') {
      // Chalkboard Dark - add pagination if too many items
      const totalItems = allItems.length
      if (totalItems > maxItemsPerPage) {
        // Create multiple pages
        const pages = []
        const itemsPerPage = Math.ceil(totalItems / Math.ceil(totalItems / maxItemsPerPage))

        for (let pageIndex = 0; pageIndex < Math.ceil(totalItems / itemsPerPage); pageIndex++) {
          const startItem = pageIndex * itemsPerPage
          const endItem = startItem + itemsPerPage
          const pageItems = allItems.slice(startItem, endItem)

          // Group by category for this page
          const pageCategories = pageItems.reduce(
            (acc, item) => {
              if (!acc[item.categoryId]) acc[item.categoryId] = []
              acc[item.categoryId].push(item)
              return acc
            },
            {} as Record<string, any[]>,
          )

          pages.push(
            <div
              key={pageIndex}
              className={cn(
                'flex h-full flex-col p-8',
                fontSizeClasses[fontSize],
                effectiveTheme === 'light'
                  ? 'bg-white text-slate-900'
                  : 'bg-slate-800 text-slate-100',
              )}
            >
              {pageIndex === 0 && (
                <div className="mb-6 text-center">
                  <h1
                    className={cn(
                      titleSizeClasses[fontSize],
                      'font-bold',
                      effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                    )}
                  >
                    {restaurantInfo.name}
                  </h1>
                  <p className={effectiveTheme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                    {restaurantInfo.address} • {restaurantInfo.phone}
                  </p>
                </div>
              )}
              <div className="flex-1 space-y-4">
                {Object.entries(pageCategories).map(([categoryId, items]) => {
                  const category = categories.find((c) => c.id === categoryId)
                  if (!category) return null
                  return (
                    <div key={categoryId}>
                      <h2
                        className={cn(
                          'mb-2 border-b pb-1 font-bold',
                          effectiveTheme === 'light' ? 'border-slate-200' : 'border-slate-600',
                          categoryAccentClass,
                        )}
                      >
                        {category.name}
                      </h2>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <div className="flex-1">
                              <span
                                className={cn(
                                  'font-medium',
                                  effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                                )}
                              >
                                {item.name}
                                {displayOptions.showChefRecommendations &&
                                  item.is_chef_recommendation && (
                                    <span className="ml-1 text-amber-500">{chefIcon}</span>
                                  )}
                              </span>
                              {displayOptions.showDescriptions && item.description && (
                                <p
                                  className={cn(
                                    'mt-1',
                                    effectiveTheme === 'light'
                                      ? 'text-slate-500'
                                      : 'text-slate-400',
                                  )}
                                >
                                  {item.description}
                                </p>
                              )}
                            </div>
                            {displayOptions.showPrices && (
                              <span
                                className={cn(
                                  'ml-2 font-semibold',
                                  effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                                )}
                              >
                                {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>,
          )
        }
        return pages
      } else {
        // Single page - original logic
        return (
          <div
            className={cn(
              'flex h-full flex-col p-8',
              fontSizeClasses[fontSize],
              effectiveTheme === 'light'
                ? 'bg-white text-slate-900'
                : 'bg-slate-800 text-slate-100',
            )}
          >
            <div className="mb-6 text-center">
              <h1
                className={cn(
                  titleSizeClasses[fontSize],
                  'font-bold',
                  effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                )}
              >
                {restaurantInfo.name}
              </h1>
              <p className={effectiveTheme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                {restaurantInfo.address} • {restaurantInfo.phone}
              </p>
            </div>
            <div className="flex-1 space-y-4">
              {Object.entries(menuItemsByCategory).map(([categoryId, items]) => {
                const category = categories.find((c) => c.id === categoryId)
                if (!category) return null
                return (
                  <div key={categoryId}>
                    <h2
                      className={cn(
                        'mb-2 border-b pb-1 font-bold',
                        effectiveTheme === 'light' ? 'border-slate-200' : 'border-slate-600',
                        categoryAccentClass,
                      )}
                    >
                      {category.name}
                    </h2>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <div className="flex-1">
                            <span
                              className={cn(
                                'font-medium',
                                effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                              )}
                            >
                              {item.name}
                              {displayOptions.showChefRecommendations &&
                                item.is_chef_recommendation && (
                                  <span className="ml-1 text-amber-500">{chefIcon}</span>
                                )}
                            </span>
                            {displayOptions.showDescriptions && item.description && (
                              <p
                                className={cn(
                                  'mt-1',
                                  effectiveTheme === 'light' ? 'text-slate-500' : 'text-slate-400',
                                )}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                          {displayOptions.showPrices && (
                            <span
                              className={cn(
                                'ml-2 font-semibold',
                                effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                              )}
                            >
                              {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      }
    } else if (selectedTemplate === '4') {
      // Tri-Fold Classic - Horizontal A4 with separators
      const categoriesArray = Object.entries(menuItemsByCategory)
      const itemsPerSection = Math.ceil(categoriesArray.length / 3)

      return (
        <div
          className={cn(
            'flex h-full p-8',
            fontSizeClasses[fontSize],
            effectiveTheme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-100',
          )}
        >
          <div className="absolute top-4 left-1/2 -translate-x-1/2 transform text-center">
            <h1
              className={cn(
                titleSizeClasses[fontSize],
                'font-bold',
                effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
              )}
            >
              {restaurantInfo.name}
            </h1>
            <p className={effectiveTheme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
              {restaurantInfo.address} • {restaurantInfo.phone}
            </p>
          </div>
          <div className="mt-16 flex flex-1">
            {/* Section 1 */}
            <div className="flex-1 border-r border-slate-300 pr-4 dark:border-slate-600">
              {categoriesArray.slice(0, itemsPerSection).map(([categoryId, items]) => {
                const category = categories.find((c) => c.id === categoryId)
                if (!category) return null
                return (
                  <div key={categoryId} className="mb-4">
                    <h2
                      className={cn(
                        'mb-2 border-b pb-1 font-bold',
                        effectiveTheme === 'light' ? 'border-slate-200' : 'border-slate-600',
                        categoryAccentClass,
                      )}
                    >
                      {category.name}
                    </h2>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <div className="flex-1">
                            <span
                              className={cn(
                                'font-medium',
                                effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                              )}
                            >
                              {item.name}
                              {displayOptions.showChefRecommendations &&
                                item.is_chef_recommendation && (
                                  <span className="ml-1 text-amber-500">{chefIcon}</span>
                                )}
                            </span>
                            {displayOptions.showDescriptions && item.description && (
                              <p
                                className={cn(
                                  'mt-1',
                                  effectiveTheme === 'light' ? 'text-slate-500' : 'text-slate-400',
                                )}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                          {displayOptions.showPrices && (
                            <span
                              className={cn(
                                'ml-2 font-semibold',
                                effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                              )}
                            >
                              {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Section 2 */}
            <div className="flex-1 border-r border-slate-300 px-4 dark:border-slate-600">
              {categoriesArray
                .slice(itemsPerSection, itemsPerSection * 2)
                .map(([categoryId, items]) => {
                  const category = categories.find((c) => c.id === categoryId)
                  if (!category) return null
                  return (
                    <div key={categoryId} className="mb-4">
                      <h2
                        className={cn(
                          'mb-2 border-b pb-1 font-bold',
                          effectiveTheme === 'light' ? 'border-slate-200' : 'border-slate-600',
                          categoryAccentClass,
                        )}
                      >
                        {category.name}
                      </h2>
                      <div className="space-y-1">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <div className="flex-1">
                              <span
                                className={cn(
                                  'font-medium',
                                  effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                                )}
                              >
                                {item.name}
                                {displayOptions.showChefRecommendations &&
                                  item.is_chef_recommendation && (
                                    <span className="ml-1 text-amber-500">{chefIcon}</span>
                                  )}
                              </span>
                              {displayOptions.showDescriptions && item.description && (
                                <p
                                  className={cn(
                                    'mt-1',
                                    effectiveTheme === 'light'
                                      ? 'text-slate-500'
                                      : 'text-slate-400',
                                  )}
                                >
                                  {item.description}
                                </p>
                              )}
                            </div>
                            {displayOptions.showPrices && (
                              <span
                                className={cn(
                                  'ml-2 font-semibold',
                                  effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                                )}
                              >
                                {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Section 3 */}
            <div className="flex-1 pl-4">
              {categoriesArray.slice(itemsPerSection * 2).map(([categoryId, items]) => {
                const category = categories.find((c) => c.id === categoryId)
                if (!category) return null
                return (
                  <div key={categoryId} className="mb-4">
                    <h2
                      className={cn(
                        'mb-2 border-b pb-1 font-bold',
                        effectiveTheme === 'light' ? 'border-slate-200' : 'border-slate-600',
                        categoryAccentClass,
                      )}
                    >
                      {category.name}
                    </h2>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <div className="flex-1">
                            <span
                              className={cn(
                                'font-medium',
                                effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                              )}
                            >
                              {item.name}
                              {displayOptions.showChefRecommendations &&
                                item.is_chef_recommendation && (
                                  <span className="ml-1 text-amber-500">{chefIcon}</span>
                                )}
                            </span>
                            {displayOptions.showDescriptions && item.description && (
                              <p
                                className={cn(
                                  'mt-1',
                                  effectiveTheme === 'light' ? 'text-slate-500' : 'text-slate-400',
                                )}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                          {displayOptions.showPrices && (
                            <span
                              className={cn(
                                'ml-2 font-semibold',
                                effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                              )}
                            >
                              {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )
    } else {
      // Default single column - add pagination if too many items
      const totalItems = allItems.length
      if (totalItems > maxItemsPerPage) {
        // Create multiple pages
        const pages = []
        const itemsPerPage = Math.ceil(totalItems / Math.ceil(totalItems / maxItemsPerPage))

        for (let pageIndex = 0; pageIndex < Math.ceil(totalItems / itemsPerPage); pageIndex++) {
          const startItem = pageIndex * itemsPerPage
          const endItem = startItem + itemsPerPage
          const pageItems = allItems.slice(startItem, endItem)

          // Group by category for this page
          const pageCategories = pageItems.reduce(
            (acc, item) => {
              if (!acc[item.categoryId]) acc[item.categoryId] = []
              acc[item.categoryId].push(item)
              return acc
            },
            {} as Record<string, any[]>,
          )

          pages.push(
            <div
              key={pageIndex}
              className={cn(
                'flex h-full flex-col p-8',
                fontSizeClasses[fontSize],
                effectiveTheme === 'light' ? 'text-slate-900' : 'text-slate-100',
              )}
            >
              {pageIndex === 0 && (
                <div className="mb-6 text-center">
                  <h1
                    className={cn(
                      titleSizeClasses[fontSize],
                      'font-bold',
                      effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                    )}
                  >
                    {restaurantInfo.name}
                  </h1>
                  <p className={effectiveTheme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                    {restaurantInfo.address} • {restaurantInfo.phone}
                  </p>
                </div>
              )}
              <div className="flex-1 space-y-4">
                {Object.entries(pageCategories).map(([categoryId, items]) => {
                  const category = categories.find((c) => c.id === categoryId)
                  if (!category) return null

                  return (
                    <div key={categoryId}>
                      <h2
                        className={cn(
                          'mb-2 pb-1 font-bold',
                          selectedTemplate === '3'
                            ? 'border-b border-slate-600'
                            : effectiveTheme === 'light'
                              ? 'border-b border-slate-200'
                              : 'border-b border-slate-600',
                          categoryAccentClass,
                        )}
                      >
                        {category.name}
                      </h2>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <div className="flex-1">
                              <span
                                className={cn(
                                  'font-medium',
                                  effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                                )}
                              >
                                {item.name}
                                {displayOptions.showChefRecommendations &&
                                  item.is_chef_recommendation && (
                                    <span className="ml-1 text-amber-500">{chefIcon}</span>
                                  )}
                              </span>
                              {displayOptions.showDescriptions && item.description && (
                                <p
                                  className={cn(
                                    'mt-1',
                                    effectiveTheme === 'light'
                                      ? 'text-slate-500'
                                      : 'text-slate-400',
                                  )}
                                >
                                  {item.description}
                                </p>
                              )}
                            </div>
                            {displayOptions.showPrices && (
                              <span
                                className={cn(
                                  'ml-2 font-semibold',
                                  effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                                )}
                              >
                                {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
                {Object.keys(pageCategories).length === 0 && (
                  <div className="flex items-center justify-center py-8">
                    <p className={effectiveTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}>
                      Chọn danh mục để xem trước
                    </p>
                  </div>
                )}
              </div>
            </div>,
          )
        }
        return pages
      } else {
        // Single page - original logic
        return (
          <div className={cn('flex h-full flex-col p-8', fontSizeClasses[fontSize])}>
            <div className="mb-6 text-center">
              <h1
                className={cn(
                  titleSizeClasses[fontSize],
                  'font-bold',
                  effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                )}
              >
                {restaurantInfo.name}
              </h1>
              <p className={effectiveTheme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                {restaurantInfo.address} • {restaurantInfo.phone}
              </p>
            </div>
            <div className="flex-1 space-y-4">
              {Object.entries(menuItemsByCategory).map(([categoryId, items]) => {
                const category = categories.find((c) => c.id === categoryId)
                if (!category) return null

                return (
                  <div key={categoryId}>
                    <h2
                      className={cn(
                        'mb-2 pb-1 font-bold',
                        effectiveTheme === 'light'
                          ? 'border-b border-slate-200'
                          : 'border-b border-slate-600',
                        categoryAccentClass,
                      )}
                    >
                      {category.name}
                    </h2>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <div className="flex-1">
                            <span
                              className={cn(
                                'font-medium',
                                effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                              )}
                            >
                              {item.name}
                              {displayOptions.showChefRecommendations &&
                                item.is_chef_recommendation && (
                                  <span className="ml-1 text-amber-500">{chefIcon}</span>
                                )}
                            </span>
                            {displayOptions.showDescriptions && item.description && (
                              <p
                                className={cn(
                                  'mt-1',
                                  effectiveTheme === 'light' ? 'text-slate-500' : 'text-slate-400',
                                )}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                          {displayOptions.showPrices && (
                            <span
                              className={cn(
                                'ml-2 font-semibold',
                                effectiveTheme === 'light' ? 'text-slate-900' : 'text-white',
                              )}
                            >
                              {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              {Object.keys(menuItemsByCategory).length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <p className={effectiveTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}>
                    Chọn danh mục để xem trước
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      }
    }
  }

  // Export function
  const handleExport = async () => {
    if (!selectedTemplate) return

    setIsExporting(true)
    try {
      // Export as PDF using @react-pdf/renderer for vector text
      const pdfBlob = await generatePDFBlob(
        restaurantInfo,
        menuItemsByCategory,
        categories,
        displayOptions,
        theme,
        accentColor,
        selectedTemplate,
        fontSize,
        chefIcon,
      )

      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `menu-${restaurantInfo.name
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Xuất thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.')
    } finally {
      setIsExporting(false)
    }
  }

  // Filter menu items based on selected categories
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = selectedCategories.has(item.category.id)

      return matchesCategory
    })
  }, [menuItems, selectedCategories])

  // Group menu items by category
  const menuItemsByCategory = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {}
    filteredMenuItems.forEach((item) => {
      const categoryId = item.category.id
      if (!grouped[categoryId]) {
        grouped[categoryId] = []
      }
      grouped[categoryId].push(item)
    })
    return grouped
  }, [filteredMenuItems])

  // Check for not found states
  if (!templates || templates.length === 0) {
    return (
      <ContainerErrorState
        title="Không tìm thấy mẫu menu"
        description="Không có mẫu menu nào khả dụng. Vui lòng tạo mẫu menu trước."
        withCard={false}
      />
    )
  }

  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate)
  if (!selectedTemplateData) {
    return (
      <ContainerErrorState
        title="Mẫu menu không tồn tại"
        description="Mẫu menu đã chọn không tìm thấy. Vui lòng chọn mẫu khác."
        withCard={false}
      />
    )
  }

  // Check for loading states
  if (categoriesLoading || menuItemsLoading || tenantLoading) {
    return <ContainerLoadingState text="Đang tải dữ liệu menu..." withCard={false} />
  }

  // Check for error states
  if (categoriesError || menuItemsError || tenantError) {
    return (
      <ContainerErrorState
        title="Lỗi tải dữ liệu"
        description="Không thể tải dữ liệu menu. Vui lòng thử lại."
        onRetry={() => {
          // Invalidate queries to retry
          // Note: This would require queryClient, but for simplicity we'll just show the error
        }}
        withCard={false}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Builder Interface */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {templates.find((t) => t.id === selectedTemplate)?.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Thiết kế menu của bạn</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {templates.find((t) => t.id === selectedTemplate)?.name}{' '}
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {templates.map((template) => (
              <DropdownMenuItem
                key={template.id}
                onClick={() => {
                  handleChangeTemplate(template.id)
                  if (template.id === '3') setTheme('dark')
                  else setTheme('light')
                }}
                disabled={template.id === selectedTemplate}
              >
                {template.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid h-[75vh] gap-6 lg:grid-cols-[400px_1fr]">
        {/* Left Panel: Tabbed Data Source & Style Controls */}
        <Card className="h-full gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-900">
          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('data')}
                className={`flex-1 border-b-2 px-4 py-3 text-sm font-medium ${
                  activeTab === 'data'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                Nguồn dữ liệu
              </button>
              <button
                onClick={() => setActiveTab('style')}
                className={`flex-1 border-b-2 px-4 py-3 text-sm font-medium ${
                  activeTab === 'style'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                Tuỳ chỉnh style
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'data' && (
              <div className="space-y-4">
                {/* Restaurant Info */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Thông tin nhà hàng
                  </p>
                  <input
                    type="text"
                    placeholder="Tên nhà hàng"
                    value={restaurantInfo.name}
                    onChange={(e) =>
                      setRestaurantInfo((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Địa chỉ"
                    value={restaurantInfo.address}
                    onChange={(e) =>
                      setRestaurantInfo((prev) => ({ ...prev, address: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Hotline"
                    value={restaurantInfo.phone}
                    onChange={(e) =>
                      setRestaurantInfo((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Danh mục ({categories.length})
                  </p>
                  <div className="max-h-48 space-y-1 overflow-y-auto">
                    {/* All categories checkbox */}
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        ref={(el) => {
                          if (el) {
                            el.indeterminate =
                              selectedCategories.size > 0 &&
                              selectedCategories.size < categories.length
                          }
                        }}
                        checked={
                          selectedCategories.size === categories.length && categories.length > 0
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            // Select all categories
                            setSelectedCategories(new Set(categories.map((cat) => cat.id)))
                          } else {
                            // Deselect all categories
                            setSelectedCategories(new Set())
                          }
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">
                        Tất cả ({selectedCategories.size}/{categories.length})
                      </span>
                    </label>
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCategories.has(category.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedCategories)
                            if (e.target.checked) {
                              newSelected.add(category.id)
                            } else {
                              newSelected.delete(category.id)
                            }
                            setSelectedCategories(newSelected)
                          }}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-slate-700 dark:text-slate-300">
                          {category.name} ({category.item_count})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Trạng thái
                  </p>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-700 dark:text-slate-300">
                      Ẩn món hết hàng/không khả dụng
                    </span>
                  </label>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Tổng số món: {filteredMenuItems.length}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {Object.keys(menuItemsByCategory).length} danh mục được chọn
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'style' && (
              <div className="space-y-6">
                {/* Theme */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Giao diện
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTheme('light')}
                      className={cn(
                        'rounded-lg border-2 p-3 text-sm transition-all',
                        theme === 'light'
                          ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10'
                          : 'border-slate-200 dark:border-slate-700',
                      )}
                    >
                      Sáng
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={cn(
                        'rounded-lg border-2 p-3 text-sm transition-all',
                        theme === 'dark'
                          ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10'
                          : 'border-slate-200 dark:border-slate-700',
                      )}
                    >
                      Tối
                    </button>
                  </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Màu nhấn</p>
                  <div className="flex gap-2">
                    {['emerald', 'blue', 'amber', 'rose'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setAccentColor(color)}
                        className={cn(
                          'h-10 w-10 rounded-lg border-2 transition-all',
                          accentColor === color
                            ? 'scale-110 border-slate-900 dark:border-white'
                            : 'border-transparent',
                          color === 'emerald' && 'bg-emerald-500',
                          color === 'blue' && 'bg-blue-500',
                          color === 'amber' && 'bg-amber-500',
                          color === 'rose' && 'bg-rose-500',
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Hiển thị</p>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={displayOptions.showPrices}
                        onChange={(e) =>
                          setDisplayOptions((prev) => ({ ...prev, showPrices: e.target.checked }))
                        }
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">Hiển thị giá</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={displayOptions.showDescriptions}
                        onChange={(e) =>
                          setDisplayOptions((prev) => ({
                            ...prev,
                            showDescriptions: e.target.checked,
                          }))
                        }
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">Hiển thị mô tả</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={displayOptions.showChefRecommendations}
                        onChange={(e) =>
                          setDisplayOptions((prev) => ({
                            ...prev,
                            showChefRecommendations: e.target.checked,
                          }))
                        }
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">
                        Biểu tượng món chef yêu thích
                      </span>
                    </label>
                  </div>
                </div>
                {/* Chef Icon Selection */}
                {displayOptions.showChefRecommendations && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Chọn biểu tượng chef
                    </p>
                    <div className="grid grid-cols-6 gap-2">
                      {['⭐', '👨‍🍳', '🔥', '❤️', '🌟', '👑', '🥇', '💎', '🎯', '🏆', '✨', '💫'].map(
                        (icon) => (
                          <button
                            key={icon}
                            onClick={() => setChefIcon(icon)}
                            className={cn(
                              'flex items-center justify-center rounded-lg border p-2 text-lg transition-colors',
                              chefIcon === icon
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600',
                            )}
                          >
                            {icon}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Middle: Preview */}
        <div className="flex flex-1 flex-col">
          <Card className="flex flex-1 flex-col gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-900">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">A4 • 210×297mm</Badge>
                <Badge variant="secondary">
                  {(() => {
                    // Calculate pages for other templates based on content
                    const allItems = Object.entries(menuItemsByCategory).flatMap(
                      ([categoryId, items]) => items.map((item) => ({ ...item, categoryId })),
                    )
                    const maxItemsPerPage =
                      selectedTemplate === '1'
                        ? 16
                        : selectedTemplate === '2'
                          ? 8
                          : selectedTemplate === '3'
                            ? 20
                            : 15
                    return allItems.length <= maxItemsPerPage
                      ? 1
                      : Math.ceil(allItems.length / maxItemsPerPage)
                  })()}{' '}
                  trang
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {/* Reset View */}
                <Button variant="ghost" size="sm" onClick={resetView} className="h-8">
                  <Eye className="mr-1 h-4 w-4" />
                  Đặt lại
                </Button>

                {/* Font Size */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Font:{' '}
                      {fontSize === 'small' ? 'Nhỏ' : fontSize === 'medium' ? 'Trung bình' : 'Lớn'}{' '}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFontSize('small')}>Nhỏ</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFontSize('medium')}>
                      Trung bình
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFontSize('large')}>Lớn</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Export Controls */}
                <div className="ml-4 flex items-center gap-2 border-l border-slate-200 pl-4 dark:border-slate-700">
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleExport}
                    disabled={isExporting || Object.keys(menuItemsByCategory).length === 0}
                    size="sm"
                  >
                    {isExporting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Đang xuất...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Xuất PDF
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview Canvas - Full Width */}
            <div
              ref={canvasRef}
              className={cn(
                'min-h-150 flex-1 overflow-hidden bg-slate-100 pt-8 select-none dark:bg-slate-800',
                isDragging ? 'cursor-grabbing' : 'cursor-default',
              )}
              style={{ overscrollBehavior: 'none' }}
              onMouseEnter={() => setIsMouseOverCanvas(true)}
              onMouseLeave={() => {
                setIsMouseOverCanvas(false)
                handleMouseUp()
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheelCapture={handleWheel}
            >
              <div
                className="relative flex h-full w-full"
                style={{
                  left: '50%',
                  transform: 'translate(-50%, 0)',
                  transformOrigin: 'top center',
                }}
              >
                {/* Multi-page Preview for templates that create multiple pages */}
                {(() => {
                  const content = renderMenuContent()
                  const isTriFold = selectedTemplate === '4'
                  const canvasWidth = isTriFold ? '1123px' : '794px' // Landscape A4 width : Portrait A4 width
                  const canvasHeight = isTriFold ? '794px' : '1123px' // Landscape A4 height : Portrait A4 height

                  if (Array.isArray(content)) {
                    // Multi-page template (like Tri-Fold) - display horizontally
                    return content.map((pageContent, index) => (
                      <div
                        key={index}
                        className={cn(
                          'preview-canvas absolute shadow-2xl',
                          theme === 'light' ? 'bg-white' : 'bg-slate-800',
                        )}
                        style={{
                          width: canvasWidth,
                          height: canvasHeight,
                          left: `${index * (parseInt(canvasWidth) + 100) * (zoom / 100)}px`,
                          top: '0',
                          transform: `translate(${panX}px, ${panY}px) scale(${zoom / 100})`,
                          transformOrigin: 'top center',
                        }}
                      >
                        {pageContent}
                      </div>
                    ))
                  } else {
                    // Single page template
                    return (
                      <div
                        className={cn(
                          'preview-canvas absolute shadow-2xl',
                          theme === 'light' ? 'bg-white' : 'bg-slate-800',
                        )}
                        style={{
                          width: canvasWidth,
                          height: canvasHeight,
                          left: '0',
                          top: '0',
                          transform: `translate(${panX}px, ${panY}px) scale(${zoom / 100})`,
                          transformOrigin: 'top center',
                        }}
                      >
                        {content}
                      </div>
                    )
                  }
                })()}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
