'use client'

import { Suspense, useState } from 'react'
import { ModifierGroupsPanel } from '@/components/admin/modifier-groups-panel'
import { ModifiersPanel } from '@/components/admin/modifiers-panel'
import { ModifierGroupModal } from '@/components/admin/modifier-group-modal'
import { ModifierModal } from '@/components/admin/modifier-modal'
import { ModifierGroupDeleteDialog } from '@/components/admin/modifier-group-delete-dialog'
import { ModifierDeleteDialog } from '@/components/admin/modifier-delete-dialog'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// Mock data structure
export interface ModifierGroup {
  id: string
  tenant_id: string
  name: string
  type: 'single_choice' | 'multiple_choice'
  is_required: boolean
  min_selections: number | null
  max_selections: number | null
  display_order: number
  created_at: string
  updated_at: string
  used_by_count?: number
}

export interface Modifier {
  id: string
  modifier_group_id: string
  name: string
  price_adjustment: number
  is_available: boolean
  display_order: number
  created_at: string
  updated_at: string
}

function ModifiersContent() {
  const searchParams = useSearchParams()
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>('1')

  // Mock data
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([
    {
      id: '1',
      tenant_id: 'tenant-1',
      name: 'Kích cỡ (Size)',
      type: 'single_choice',
      is_required: true,
      min_selections: 1,
      max_selections: 1,
      display_order: 1,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      used_by_count: 12,
    },
    {
      id: '2',
      tenant_id: 'tenant-1',
      name: 'Topping',
      type: 'multiple_choice',
      is_required: false,
      min_selections: 0,
      max_selections: null,
      display_order: 2,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      used_by_count: 8,
    },
    {
      id: '3',
      tenant_id: 'tenant-1',
      name: 'Độ chín',
      type: 'single_choice',
      is_required: false,
      min_selections: 0,
      max_selections: 1,
      display_order: 3,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      used_by_count: 5,
    },
  ])

  const [modifiers, setModifiers] = useState<Modifier[]>([
    {
      id: '1',
      modifier_group_id: '1',
      name: 'Nhỏ (Small)',
      price_adjustment: -10000,
      is_available: true,
      display_order: 1,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: '2',
      modifier_group_id: '1',
      name: 'Vừa (Medium)',
      price_adjustment: 0,
      is_available: true,
      display_order: 2,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: '3',
      modifier_group_id: '1',
      name: 'Lớn (Large)',
      price_adjustment: 15000,
      is_available: true,
      display_order: 3,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: '4',
      modifier_group_id: '2',
      name: 'Phô mai thêm',
      price_adjustment: 10000,
      is_available: true,
      display_order: 1,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: '5',
      modifier_group_id: '2',
      name: 'Thịt xông khói',
      price_adjustment: 15000,
      is_available: true,
      display_order: 2,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: '6',
      modifier_group_id: '3',
      name: 'Tái',
      price_adjustment: 0,
      is_available: true,
      display_order: 1,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: '7',
      modifier_group_id: '3',
      name: 'Chín vừa',
      price_adjustment: 0,
      is_available: true,
      display_order: 2,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ])

  const modalGroupOpen = searchParams.get('modal') === 'group'
  const modalModifierOpen = searchParams.get('modal') === 'modifier'

  return (
    <div className="space-y-6">
      {/* Two Panel Layout */}
      <div className="grid gap-6 lg:grid-cols-[35%_1fr]">
        {/* Left Panel - Groups */}
        <ModifierGroupsPanel
          groups={modifierGroups}
          selectedGroupId={selectedGroupId}
          onSelectGroup={setSelectedGroupId}
          onReorderGroups={setModifierGroups}
        />

        {/* Right Panel - Modifiers */}
        <ModifiersPanel
          selectedGroup={modifierGroups.find((g) => g.id === selectedGroupId) || null}
          modifiers={modifiers.filter((m) => m.modifier_group_id === selectedGroupId)}
          onReorderModifiers={setModifiers}
        />
      </div>

      {/* Modals */}
      <ModifierGroupModal open={modalGroupOpen} groups={modifierGroups} />
      <ModifierModal open={modalModifierOpen} selectedGroupId={selectedGroupId} />
      <ModifierGroupDeleteDialog />
      <ModifierDeleteDialog />
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

export default function ModifiersPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ModifiersContent />
    </Suspense>
  )
}
