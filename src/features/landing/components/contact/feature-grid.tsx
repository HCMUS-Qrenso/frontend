'use client'

import { BarChart3, CreditCard, Globe, Laptop, QrCode, Shield, Smartphone, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

const featureKeys = [
  { icon: BarChart3, key: 'dashboard' },
  { icon: QrCode, key: 'tables' },
  { icon: Laptop, key: 'kds' },
  { icon: Smartphone, key: 'customerOrdering' },
  { icon: CreditCard, key: 'payment' },
  { icon: Zap, key: 'analytics' },
  { icon: Shield, key: 'roles' },
  { icon: Globe, key: 'multiLang' },
]

export function FeatureGrid() {
  const t = useTranslations('landing.features')

  return (
    <section
      id="features"
      className="border-b border-slate-200 bg-slate-50 py-20 md:py-32 dark:border-slate-800/50 dark:bg-slate-900/50"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">
              {t('title')}
            </h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              {t('subtitle')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featureKeys.map((feature, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:scale-105 hover:border-emerald-500/50 hover:bg-slate-50 hover:outline-2 hover:outline-emerald-500/30 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900"
              >
                <div className="mb-4 inline-flex rounded-xl bg-emerald-500/10 p-3">
                  <feature.icon className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                  {t(`items.${feature.key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {t(`items.${feature.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

