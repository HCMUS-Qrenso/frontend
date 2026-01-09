'use client'

import { Label } from '@/src/components/ui/label'
import { Switch } from '@/src/components/ui/switch'
import { Input } from '@/src/components/ui/input'
import { Button } from '@/src/components/ui/button'
import { Plus, X, Copy } from 'lucide-react'
import { FieldHelp } from './field-help'
import { OnboardingDraft } from '../types'

interface StepHoursProps {
  data: OnboardingDraft['hours']
  onChange: (data: OnboardingDraft['hours']) => void
}

const DAYS = [
  { key: 'monday', label: 'Thứ Hai' },
  { key: 'tuesday', label: 'Thứ Ba' },
  { key: 'wednesday', label: 'Thứ Tư' },
  { key: 'thursday', label: 'Thứ Năm' },
  { key: 'friday', label: 'Thứ Sáu' },
  { key: 'saturday', label: 'Thứ Bảy' },
  { key: 'sunday', label: 'Chủ Nhật' },
]

// Quick presets
const PRESETS = [
  {
    label: '☀️ Standard',
    desc: 'T2-T5: 9-22h, T6-T7: 9-23h, CN: 10-21h',
    apply: () => ({
      monday: { isOpen: true, slots: [{ open: '09:00', close: '22:00' }] },
      tuesday: { isOpen: true, slots: [{ open: '09:00', close: '22:00' }] },
      wednesday: { isOpen: true, slots: [{ open: '09:00', close: '22:00' }] },
      thursday: { isOpen: true, slots: [{ open: '09:00', close: '22:00' }] },
      friday: { isOpen: true, slots: [{ open: '09:00', close: '23:00' }] },
      saturday: { isOpen: true, slots: [{ open: '09:00', close: '23:00' }] },
      sunday: { isOpen: true, slots: [{ open: '10:00', close: '21:00' }] },
    }),
  },
  {
    label: '🔄 24/7',
    desc: 'Mở cửa 24/7',
    apply: () => {
      const allDay = { isOpen: true, slots: [{ open: '00:00', close: '23:59' }] }
      return {
        monday: allDay,
        tuesday: allDay,
        wednesday: allDay,
        thursday: allDay,
        friday: allDay,
        saturday: allDay,
        sunday: allDay,
      }
    },
  },
  {
    label: '🏢 Giờ văn phòng',
    desc: 'T2-T6: 11-14h & 18-22h',
    apply: () => {
      const weekday = {
        isOpen: true,
        slots: [
          { open: '11:00', close: '14:00' },
          { open: '18:00', close: '22:00' },
        ],
      }
      const weekend = { isOpen: false, slots: [] }
      return {
        monday: weekday,
        tuesday: weekday,
        wednesday: weekday,
        thursday: weekday,
        friday: weekday,
        saturday: weekend,
        sunday: weekend,
      }
    },
  },
]

type DayHours = { isOpen: boolean; slots: Array<{ open: string; close: string }> }
type RawDayData = DayHours | string | undefined

// Helper to parse any format into DayHours
const parseDayData = (raw: RawDayData): DayHours => {
  const defaultSlots = [{ open: '09:00', close: '22:00' }]

  if (!raw) return { isOpen: true, slots: defaultSlots }

  if (typeof raw === 'string') {
    const parts = raw.split('-')
    return { isOpen: true, slots: [{ open: parts[0] || '09:00', close: parts[1] || '22:00' }] }
  }

  // It's an object
  const dayData = raw as DayHours
  if (!dayData.slots || !Array.isArray(dayData.slots) || dayData.slots.length === 0) {
    return { ...dayData, slots: defaultSlots }
  }

  return dayData
}

export function StepHours({ data, onChange }: StepHoursProps) {
  const hours = (data.operating_hours || {}) as Record<string, RawDayData>

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    onChange({ operating_hours: preset.apply() })
  }

  const updateDay = (dayKey: string, dayData: DayHours) => {
    // Build new hours with normalized data for all days
    const normalizedHours: Record<string, DayHours> = {}
    DAYS.forEach((d) => {
      normalizedHours[d.key] = d.key === dayKey ? dayData : parseDayData(hours[d.key])
    })
    onChange({ operating_hours: normalizedHours })
  }

  const toggleDay = (dayKey: string, isOpen: boolean) => {
    const currentDay = parseDayData(hours[dayKey])
    updateDay(dayKey, { ...currentDay, isOpen })
  }

  const updateSlot = (
    dayKey: string,
    slotIndex: number,
    field: 'open' | 'close',
    value: string,
  ) => {
    const currentDay = parseDayData(hours[dayKey])
    const newSlots = [...currentDay.slots]
    newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value }
    updateDay(dayKey, { ...currentDay, slots: newSlots })
  }

  const addSlot = (dayKey: string) => {
    const currentDay = parseDayData(hours[dayKey])
    const lastSlot = currentDay.slots[currentDay.slots.length - 1]
    updateDay(dayKey, {
      ...currentDay,
      slots: [...currentDay.slots, { open: lastSlot?.close || '18:00', close: '22:00' }],
    })
  }

  const removeSlot = (dayKey: string, slotIndex: number) => {
    const currentDay = parseDayData(hours[dayKey])
    const newSlots = currentDay.slots.filter(
      (_: { open: string; close: string }, i: number) => i !== slotIndex,
    )
    updateDay(dayKey, {
      ...currentDay,
      slots: newSlots.length ? newSlots : [{ open: '09:00', close: '22:00' }],
    })
  }

  const copyToAll = (fromDayKey: string) => {
    const sourceDay = parseDayData(hours[fromDayKey])
    const newHours: Record<string, DayHours> = {}
    DAYS.forEach((day) => {
      newHours[day.key] = { ...sourceDay }
    })
    onChange({ operating_hours: newHours })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Giờ hoạt động</h2>
        <p className="text-muted-foreground text-sm">Cấu hình giờ mở cửa theo từng ngày</p>
      </div>

      {/* Quick presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-sm">Chọn nhanh:</span>
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => applyPreset(preset)}
            className="hover:bg-muted rounded-full border px-3 py-1 text-sm transition-colors"
            title={preset.desc}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {DAYS.map((day) => {
          const dayData = parseDayData(hours[day.key])

          return (
            <div key={day.key} className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={dayData.isOpen}
                    onCheckedChange={(checked) => toggleDay(day.key, checked)}
                  />
                  <span className="w-20 font-medium">{day.label}</span>
                </div>

                {dayData.isOpen && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToAll(day.key)}
                    title="Sao chép sang tất cả ngày"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {dayData.isOpen ? (
                <div className="ml-14 space-y-2">
                  {dayData.slots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={slot.open}
                        onChange={(e) => updateSlot(day.key, slotIndex, 'open', e.target.value)}
                        className="w-36"
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        type="time"
                        value={slot.close}
                        onChange={(e) => updateSlot(day.key, slotIndex, 'close', e.target.value)}
                        className="w-36"
                      />
                      {dayData.slots.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSlot(day.key, slotIndex)}
                          className="text-destructive h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addSlot(day.key)}
                    className="text-muted-foreground"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Thêm ca
                  </Button>
                </div>
              ) : (
                <span className="text-muted-foreground ml-14 text-sm">Đóng cửa</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
