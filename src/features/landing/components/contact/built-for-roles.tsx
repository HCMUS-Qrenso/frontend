'use client'

import { useState } from 'react'
import { cn } from '@/src/lib/utils'
import { Crown, ChefHat, UserCheck, Calculator } from 'lucide-react'
import { useTranslations } from 'next-intl'

const roleConfigs = [
  { id: 'owner', icon: Crown },
  { id: 'cashier', icon: Calculator },
  { id: 'waiter', icon: UserCheck },
  { id: 'chef', icon: ChefHat },
]

export function BuiltForRoles() {
  const [activeRole, setActiveRole] = useState('owner')
  const t = useTranslations('landing.builtForRoles')

  return (
    <section className="border-b border-slate-200 bg-slate-50 py-20 md:py-32 dark:border-slate-800/50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">
              {t('title')}
            </h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              {t('subtitle')}
            </p>
          </div>

          {/* Role Tabs */}
          <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {roleConfigs.map((role) => (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={cn(
                  'flex flex-col items-center gap-3 rounded-2xl border p-6 transition-all',
                  activeRole === role.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-300 bg-white hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700',
                )}
              >
                <div
                  className={cn(
                    'rounded-xl p-3',
                    activeRole === role.id ? 'bg-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800',
                  )}
                >
                  <role.icon
                    className={cn(
                      'h-6 w-6',
                      activeRole === role.id
                        ? 'text-emerald-400'
                        : 'text-slate-600 dark:text-slate-400',
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'text-sm font-medium',
                    activeRole === role.id
                      ? 'text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400',
                  )}
                >
                  {t(`roles.${role.id}.label`)}
                </span>
              </button>
            ))}
          </div>

          {/* Pain Points & Solutions */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Pain Points */}
            <div className="rounded-2xl border bg-white p-8 outline-2 outline-red-500/30 transition-all duration-100 hover:scale-105 dark:bg-slate-900/50">
              <h3 className="mb-6 text-xl font-semibold text-slate-900 dark:text-white">
                {t('painPointsTitle')}
              </h3>
              <ul className="space-y-4">
                {[0, 1, 2].map((index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                    <span className="text-slate-600 dark:text-slate-300">
                      {t(`roles.${activeRole}.painPoints.${index}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solutions */}
            <div className="rounded-2xl bg-emerald-500/5 p-8 outline-2 outline-emerald-500/30 transition-all duration-100 hover:scale-105">
              <h3 className="mb-6 text-xl font-semibold text-slate-900 dark:text-white">
                {t('solutionsTitle')}
              </h3>
              <ul className="space-y-4">
                {[0, 1, 2].map((index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    <span className="text-slate-600 dark:text-slate-300">
                      {t(`roles.${activeRole}.solutions.${index}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

