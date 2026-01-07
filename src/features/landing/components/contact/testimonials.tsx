'use client'

import { Star } from 'lucide-react'
import { useTranslations } from 'next-intl'

const testimonialAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenMinhTuan&backgroundColor=b6e3f4,c0aede,d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=TranThiHuong&backgroundColor=ffd5dc,ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=LeHoangNam&backgroundColor=c7d2fe,ffd5dc',
]

export function Testimonials() {
  const t = useTranslations('landing.testimonials')

  return (
    <section className="border-b border-slate-200 bg-white py-20 md:py-32 dark:border-slate-800/50 dark:bg-slate-950">
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

          {/* Testimonials Grid */}
          <div className="grid gap-8 md:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all duration-100 hover:scale-105 hover:outline-2 hover:outline-emerald-500/30 dark:border-slate-800 dark:bg-slate-900/50"
              >
                {/* Rating */}
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400 transition-all duration-200 group-hover:scale-110 group-hover:rotate-72 group-hover:text-yellow-500"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="mb-6 text-slate-600 transition-all duration-100 group-hover:font-semibold dark:text-slate-300">
                  {t(`items.${index}.quote`)}
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <img
                    src={testimonialAvatars[index]}
                    alt={t(`items.${index}.name`)}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {t(`items.${index}.name`)}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {t(`items.${index}.role`)} - {t(`items.${index}.restaurant`)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

