'use client'

import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Label } from '@/src/components/ui/label'
import { Switch } from '@/src/components/ui/switch'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { SettingsSection } from './settings-section'
import { Clock, Plus, Trash2, Copy } from 'lucide-react'
import type { OperatingHours, DayOperatingHours, TimeSlot } from '../types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'

// Days of the week in order
const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

type DayKey = (typeof DAYS)[number]

// Default time slot
const DEFAULT_SLOT: TimeSlot = { open: '09:00', close: '22:00' }

// Default day config
const DEFAULT_DAY: DayOperatingHours = {
  isOpen: true,
  slots: [{ ...DEFAULT_SLOT }],
}

interface OperatingHoursFormProps {
  settings: OperatingHours | null
  onChange: (settings: OperatingHours) => void
}

export function OperatingHoursForm({
  settings,
  onChange,
}: OperatingHoursFormProps) {
  const t = useTranslations('settings.operatingHours')

  // Get day settings with defaults
  const getDaySettings = useCallback(
    (day: DayKey): DayOperatingHours => {
      if (!settings || !settings[day]) {
        return { isOpen: false, slots: [] }
      }
      return settings[day] as DayOperatingHours
    },
    [settings],
  )

  // Update a specific day
  const updateDay = useCallback(
    (day: DayKey, daySettings: DayOperatingHours) => {
      onChange({
        ...settings,
        [day]: daySettings,
      })
    },
    [settings, onChange],
  )

  // Toggle day open/closed
  const toggleDay = useCallback(
    (day: DayKey, isOpen: boolean) => {
      const current = getDaySettings(day)
      updateDay(day, {
        isOpen,
        slots: isOpen && current.slots.length === 0 ? [{ ...DEFAULT_SLOT }] : current.slots,
      })
    },
    [getDaySettings, updateDay],
  )

  // Update a time slot
  const updateSlot = useCallback(
    (day: DayKey, slotIndex: number, field: 'open' | 'close', value: string) => {
      const current = getDaySettings(day)
      const newSlots = [...current.slots]
      newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value }
      updateDay(day, { ...current, slots: newSlots })
    },
    [getDaySettings, updateDay],
  )

  // Add a slot to a day
  const addSlot = useCallback(
    (day: DayKey) => {
      const current = getDaySettings(day)
      const lastSlot = current.slots[current.slots.length - 1]
      // Default new slot starts 1 hour after last close
      const newSlot: TimeSlot = lastSlot
        ? { open: lastSlot.close, close: '23:00' }
        : { ...DEFAULT_SLOT }
      updateDay(day, { ...current, slots: [...current.slots, newSlot] })
    },
    [getDaySettings, updateDay],
  )

  // Remove a slot from a day
  const removeSlot = useCallback(
    (day: DayKey, slotIndex: number) => {
      const current = getDaySettings(day)
      const newSlots = current.slots.filter((_, i) => i !== slotIndex)
      updateDay(day, { ...current, slots: newSlots })
    },
    [getDaySettings, updateDay],
  )

  // Copy schedule from one day to others
  const copySchedule = useCallback(
    (fromDay: DayKey, toDays: DayKey[]) => {
      const source = getDaySettings(fromDay)
      const updates: OperatingHours = { ...settings }
      toDays.forEach((day) => {
        updates[day] = { ...source, slots: source.slots.map((s) => ({ ...s })) }
      })
      onChange(updates)
    },
    [settings, getDaySettings, onChange],
  )

  // Get day label
  const getDayLabel = (day: DayKey): string => {
    const labels: Record<DayKey, string> = {
      monday: t('monday'),
      tuesday: t('tuesday'),
      wednesday: t('wednesday'),
      thursday: t('thursday'),
      friday: t('friday'),
      saturday: t('saturday'),
      sunday: t('sunday'),
    }
    return labels[day]
  }

  return (
    <SettingsSection
      id="operating-hours"
      title={t('title')}
      description={t('description')}
      icon={Clock}
    >
      <div className="space-y-4">
        {DAYS.map((day) => {
          const daySettings = getDaySettings(day)
          const isOpen = daySettings.isOpen

          return (
            <div
              key={day}
              className="flex flex-col gap-3 rounded-lg border p-4"
            >
              {/* Day header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={isOpen}
                    onCheckedChange={(checked) => toggleDay(day, checked)}
                  />
                  <Label className="font-medium">{getDayLabel(day)}</Label>
                  {!isOpen && (
                    <span className="text-sm text-muted-foreground">
                      {t('closed')}
                    </span>
                  )}
                </div>

                {/* Copy dropdown */}
                {isOpen && daySettings.slots.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 gap-1">
                        <Copy className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{t('copyTo')}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          copySchedule(
                            day,
                            DAYS.filter((d) => d !== day),
                          )
                        }
                      >
                        {t('copyToAll')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          copySchedule(
                            day,
                            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].filter(
                              (d) => d !== day,
                            ) as DayKey[],
                          )
                        }
                      >
                        {t('copyToWeekdays')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          copySchedule(
                            day,
                            ['saturday', 'sunday'].filter((d) => d !== day) as DayKey[],
                          )
                        }
                      >
                        {t('copyToWeekend')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Time slots */}
              {isOpen && (
                <div className="ml-10 space-y-2">
                  {daySettings.slots.map((slot, slotIndex) => (
                    <div
                      key={slotIndex}
                      className="flex items-center gap-2"
                    >
                      <Input
                        type="time"
                        value={slot.open}
                        onChange={(e) =>
                          updateSlot(day, slotIndex, 'open', e.target.value)
                        }
                        className="w-36"
                      />
                      <span className="text-muted-foreground">—</span>
                      <Input
                        type="time"
                        value={slot.close}
                        onChange={(e) =>
                          updateSlot(day, slotIndex, 'close', e.target.value)
                        }
                        className="w-36"
                      />
                      {daySettings.slots.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeSlot(day, slotIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* Add slot button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-muted-foreground"
                    onClick={() => addSlot(day)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t('addSlot')}
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </SettingsSection>
  )
}
