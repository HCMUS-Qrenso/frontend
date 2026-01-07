'use client'

import { Button } from '@/src/components/ui/button'
import { ThemeToggle } from '@/src/components/theme-toggle'
import { LanguageSwitcher } from '@/src/components/language-switcher'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/src/i18n/navigation'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = useTranslations('landing')

  const navItems = [
    { label: t('nav.features'), href: '/#features' },
    { label: t('nav.howItWorks'), href: '/#how-it-works' },
    { label: t('nav.pricing'), href: '/#pricing' },
    { label: t('nav.faq'), href: '/#faq' },
    { label: t('nav.contact'), href: '/contact' },
  ]

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Only handle hash links, not regular page links
    if (!href.startsWith('#')) {
      return
    }

    e.preventDefault()
    const targetId = href.substring(1)
    const targetElement = document.getElementById(targetId)

    if (targetElement) {
      const headerOffset = 80 // Offset for sticky header (64px height + some padding)
      const elementPosition = targetElement.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }

    // Close mobile menu if open
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl">
            <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">Qrenso</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) =>
            item.href.startsWith('#') ? (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleSmoothScroll(e, item.href)}
                className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button
            variant="outline"
            className="border-slate-300 bg-transparent text-slate-900 dark:border-slate-700 dark:text-white"
            asChild
          >
            <Link href="/auth/login">{t('auth.login')}</Link>
          </Button>
          <Button className="bg-emerald-600 text-white hover:bg-emerald-700" asChild>
            <Link href="/contact">{t('cta.bookDemo')}</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-slate-900 dark:text-white" />
          ) : (
            <Menu className="h-6 w-6 text-slate-900 dark:text-white" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden dark:border-slate-800 dark:bg-slate-950">
          <nav className="container mx-auto flex flex-col gap-4 px-4 py-6">
            {navItems.map((item) =>
              item.href.startsWith('#') ? (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleSmoothScroll(e, item.href)}
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ),
            )}
            <div className="mt-4 flex items-center gap-3">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
                asChild
              >
                <Link href="/auth/login">{t('auth.login')}</Link>
              </Button>
              <Button className="bg-emerald-600 text-white hover:bg-emerald-700" asChild>
                <Link href="/contact">{t('cta.bookDemo')}</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

