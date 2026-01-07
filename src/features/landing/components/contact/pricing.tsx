'use client'

import { Button } from '@/src/components/ui/button'
import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

const planKeys = ['starter', 'pro', 'enterprise'] as const

export function Pricing() {
  const t = useTranslations('landing.pricing')

  return (
    <section
      id="pricing"
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

          {/* Pricing Cards */}
          <div className="grid gap-10 lg:grid-cols-3">
            {planKeys.map((planKey, index) => {
              const isHighlighted = planKey === 'pro'
              const isEnterprise = planKey === 'enterprise'
              
              return (
                <div
                  key={index}
                  className={`rounded-2xl border p-8 transition-all duration-100 hover:scale-105 ${
                    isHighlighted
                      ? 'scale-105 border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/20 hover:scale-110'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50'
                  }`}
                >
                  {/* Plan Name */}
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {t(`plans.${planKey}.name`)}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {t(`plans.${planKey}.description`)}
                  </p>

                  {/* Price */}
                  <div className="mt-6">
                    {!isEnterprise ? (
                      <>
                        <span className="text-4xl font-bold text-slate-900 dark:text-white">
                          {t(`plans.${planKey}.price`)}₫
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">/{t('perMonth')}</span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">
                        {t(`plans.${planKey}.price`)}
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <Button
                    className={`mt-8 w-full ${
                      isHighlighted
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700'
                    }`}
                  >
                    {t(`plans.${planKey}.cta`)}
                  </Button>

                  {/* Features */}
                  <ul className="mt-8 space-y-3">
                    {Array.from({ 
                      length: planKey === 'starter' ? 6 : planKey === 'pro' ? 8 : 7 
                    }).map((_, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {t(`plans.${planKey}.features.${featureIndex}`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          {/* Note */}
          <p className="mt-12 text-center text-sm text-slate-500 dark:text-slate-400">
            {t('trialNote')}
          </p>
        </div>
      </div>
    </section>
  )
}

