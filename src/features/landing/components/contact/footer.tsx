'use client'

import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('landing.footer')

  return (
    <footer id="contact" className="bg-white py-12 dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl">
                <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">Qrenso</span>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{t('tagline')}</p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
              {t('product.title')}
            </h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <a href="#features" className="hover:text-slate-900 dark:hover:text-white">
                  {t('product.features')}
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white">
                  {t('product.pricing')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-900 dark:hover:text-white">
                  {t('product.caseStudies')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-900 dark:hover:text-white">
                  {t('product.roadmap')}
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
              {t('company.title')}
            </h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <a href="#" className="hover:text-slate-900 dark:hover:text-white">
                  {t('company.about')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-900 dark:hover:text-white">
                  {t('company.blog')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-900 dark:hover:text-white">
                  {t('company.careers')}
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-slate-900 dark:hover:text-white">
                  {t('company.contact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
              {t('legal.title')}
            </h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <a href="#" className="hover:text-slate-900 dark:hover:text-white">
                  {t('legal.terms')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-900 dark:hover:text-white">
                  {t('legal.privacy')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-900 dark:hover:text-white">
                  {t('legal.refund')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-slate-200 pt-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <p>{t('copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
