'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Grid3x3, List, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react'
import { useFormat } from '@/src/hooks/use-format'
import { useTranslations } from 'next-intl'

interface KdsTopBarProps {
  activeTickets: number
  overdueTickets: number
  lastUpdated: Date
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  isFullscreen: boolean
  toggleFullscreen: () => void
  isLoading?: boolean
  socketConnected?: boolean
}

export function KdsTopBar({
  activeTickets,
  overdueTickets,
  lastUpdated,
  viewMode,
  setViewMode,
  soundEnabled,
  setSoundEnabled,
  isFullscreen,
  toggleFullscreen,
  isLoading,
  socketConnected,
}: KdsTopBarProps) {
  const { formatRelativeDate } = useFormat()
  const t = useTranslations('kds')

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      {/* Left: KPIs + Status */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
          ) : socketConnected ? (
            <div className="h-2 w-2 rounded-full bg-emerald-500" title={t('connected')} />
          ) : (
            <div className="h-2 w-2 rounded-full bg-amber-500" title={t('disconnected')} />
          )}
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isLoading
              ? t('loading')
              : socketConnected
                ? t('realtime')
                : t('updatedAt', { time: formatRelativeDate(lastUpdated.toISOString()) })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            {t('ordersCount', { count: activeTickets })}
          </Badge>
          {overdueTickets > 0 && (
            <Badge className="bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400">
              {t('overdueCount', { count: overdueTickets })}
            </Badge>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* View Toggle */}
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700">
          <Button
            variant="ghost"
            size="sm"
            className={viewMode === 'grid' ? 'bg-emerald-50 dark:bg-emerald-500/10' : ''}
            onClick={() => setViewMode('grid')}
            title={t('gridView')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={viewMode === 'list' ? 'bg-emerald-50 dark:bg-emerald-500/10' : ''}
            onClick={() => setViewMode('list')}
            title={t('listView')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Sound Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? t('soundOn') : t('soundOff')}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>

        {/* Fullscreen */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          title={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

