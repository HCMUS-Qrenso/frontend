'use client'

import { CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

const stepKeys = ['step1', 'step2', 'step3', 'step4']

export function HowItWorks() {
  const t = useTranslations('landing.howItWorks')

  return (
    <section
      id="how-it-works"
      className="border-b border-slate-200 bg-white py-20 md:py-32 dark:border-slate-800/50 dark:bg-slate-950"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">
              {t('title')}
            </h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              {t('subtitle')}
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-8">
            {stepKeys.map((stepKey, index) => (
              <div
                key={index}
                className="group relative flex gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all hover:scale-105 hover:border-emerald-500/50 hover:outline-2 hover:outline-emerald-500/30 dark:border-slate-800 dark:bg-slate-900/50"
              >
                {/* Number */}
                <div className="flex-shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl font-bold text-emerald-400">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
                    {t(`steps.${stepKey}.title`)}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {t(`steps.${stepKey}.description`)}
                  </p>
                </div>

                {/* Check icon */}
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

