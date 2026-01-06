'use client'

import { Suspense, useState } from 'react'
import { ModifierGroupsPanel } from '@/src/features/admin/menu/components/modifiers/modifier-groups-panel'
import { ModifiersPanel } from '@/src/features/admin/menu/components/modifiers/modifiers-panel'
import { ModifierGroupModal } from '@/src/features/admin/menu/components/modifiers/modifier-group-modal'
import { ModifierModal } from '@/src/features/admin/menu/components/modifiers/modifier-modal'
import { ModifierGroupDeleteDialog } from '@/src/features/admin/menu/components/modifiers/modifier-group-delete-dialog'
import { ModifierDeleteDialog } from '@/src/features/admin/menu/components/modifiers/modifier-delete-dialog'
import { Loader2, AlertCircle } from 'lucide-react'
import { useModifierGroupsQuery } from '@/src/features/admin/menu/queries/modifiers.queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { Modifier, type ModifierGroup } from '@/src/features/admin/menu/types/modifiers'

function ModifiersContent() {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const { handleErrorWithStatus } = useErrorHandler()

  // Fetch modifier groups from API
  const {
    data: groupsData,
    isLoading: isLoadingGroups,
    error: groupsError,
  } = useModifierGroupsQuery({
    include_usage_count: true,
    sort_by: 'display_order',
    sort_order: 'asc',
  })

  // Handle errors
  if (groupsError) {
    handleErrorWithStatus(groupsError)
  }

  const modifierGroups = groupsData?.data.modifier_groups || []

  // Auto-select first group if none selected
  if (modifierGroups.length > 0 && !selectedGroupId) {
    setSelectedGroupId(modifierGroups[0].id)
  }

  const [selectedModifier, setSelectedModifier] = useState<Modifier | null>(null)

  const [modalGroupOpen, setModalGroupOpen] = useState(false)
  const [modalGroupMode, setModalGroupMode] = useState<'create' | 'edit'>('create')
  const [modalModifierOpen, setModalModifierOpen] = useState(false)
  const [modalModifierMode, setModalModifierMode] = useState<'create' | 'edit'>('create')
  const [modalDeleteGroupOpen, setModalDeleteGroupOpen] = useState(false)
  const [modalDeleteModifierOpen, setModalDeleteModifierOpen] = useState(false)

  // Loading state
  if (isLoadingGroups) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  // Error state
  if (groupsError && !groupsData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="mb-4 h-12 w-12 text-red-600" />
        <p className="text-sm text-slate-500">Không thể tải dữ liệu. Vui lòng thử lại.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Two Panel Layout */}
      <div className="grid gap-6 lg:grid-cols-[35%_1fr]">
        {/* Left Panel - Groups */}
        <ModifierGroupsPanel
          groups={modifierGroups}
          selectedGroupId={selectedGroupId}
          onSelectGroup={setSelectedGroupId}
          onCreateGroup={() => {
            setModalGroupMode('create')
            setModalGroupOpen(true)
          }}
          onEditGroup={() => {
            setModalGroupMode('edit')
            setModalGroupOpen(true)
          }}
          onDeleteGroup={() => {
            setModalDeleteGroupOpen(true)
          }}
        />

        {/* Right Panel - Modifiers */}
        <ModifiersPanel
          selectedGroup={modifierGroups.find((g) => g.id === selectedGroupId) || null}
          selectedGroupId={selectedGroupId}
          onCreateModifier={() => {
            setModalModifierMode('create')
            setModalModifierOpen(true)
          }}
          onEditModifier={(modifier: Modifier) => {
            setSelectedModifier(modifier)
            setModalModifierMode('edit')
            setModalModifierOpen(true)
          }}
          onDeleteModifier={(modifier: Modifier) => {
            setSelectedModifier(modifier)
            setModalDeleteModifierOpen(true)
          }}
        />
      </div>

      {/* Modals */}
      <ModifierGroupModal
        open={modalGroupOpen}
        mode={modalGroupMode}
        modifierGroup={modifierGroups.find((g: ModifierGroup) => g.id === selectedGroupId) || null}
        onOpenChange={setModalGroupOpen}
      />

      <ModifierGroupDeleteDialog
        open={modalDeleteGroupOpen}
        modifierGroup={modifierGroups.find((g: ModifierGroup) => g.id === selectedGroupId) || null}
        onOpenChange={setModalDeleteGroupOpen}
      />

      <ModifierModal
        open={modalModifierOpen}
        mode={modalModifierMode}
        modifier={selectedModifier}
        onOpenChange={setModalModifierOpen}
        selectedGroupId={selectedGroupId}
      />

      <ModifierDeleteDialog
        open={modalDeleteModifierOpen}
        modifier={selectedModifier}
        onOpenChange={setModalDeleteModifierOpen}
      />
    </div>
  )
}

export default function ModifiersPage() {
  return (
    <Suspense fallback={null}>
      <ModifiersContent />
    </Suspense>
  )
}
