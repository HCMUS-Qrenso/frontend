'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { useTranslations } from 'next-intl'

const faqCount = 8

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const t = useTranslations('landing.faq')

  return (
    <section
      id="faq"
      className="border-b border-slate-200 bg-white py-20 md:py-32 dark:border-slate-800/50 dark:bg-slate-950"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Section Header */}
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">
              {t('title')}
            </h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {Array.from({ length: faqCount }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50"
              >
                <button
                  className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-900"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="pr-8 font-semibold text-slate-900 dark:text-white">
                    {t(`items.${index}.question`)}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 shrink-0 text-slate-500 transition-transform dark:text-slate-400',
                      openIndex === index && 'rotate-180',
                    )}
                  />
                </button>
                {openIndex === index && (
                  <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
                    <p className="text-slate-600 dark:text-slate-300">
                      {t(`items.${index}.answer`)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
