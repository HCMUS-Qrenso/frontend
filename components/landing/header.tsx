'use client'

import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { label: 'Tính năng', href: '#features' },
    { label: 'Cách hoạt động', href: '#how-it-works' },
    { label: 'Bảng giá', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Liên hệ', href: '/contact' },
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
    <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <span className="text-lg font-bold text-white">Q</span>
          </div>
          <span className="text-xl font-bold text-white">Qrenso</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) =>
            item.href.startsWith('#') ? (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleSmoothScroll(e, item.href)}
                className="text-sm text-slate-300 transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-slate-300 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="outline" className="border-slate-700 bg-transparent text-white" asChild>
            <Link href="/auth/login">Đăng nhập</Link>
          </Button>
          <Button className="bg-emerald-600 text-white hover:bg-emerald-700" asChild>
            <Link href="/contact">Đặt lịch demo</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Menu className="h-6 w-6 text-white" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-800 bg-slate-950 md:hidden">
          <nav className="container mx-auto flex flex-col gap-4 px-4 py-6">
            {navItems.map((item) =>
              item.href.startsWith('#') ? (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleSmoothScroll(e, item.href)}
                  className="text-slate-300 hover:text-white"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-slate-300 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ),
            )}
            <div className="mt-4 flex flex-col gap-3">
              <Button
                variant="outline"
                className="border-slate-700 bg-transparent text-white hover:bg-slate-800"
                asChild
              >
                <Link href="/auth/login">Đăng nhập</Link>
              </Button>
              <Button className="bg-emerald-600 text-white hover:bg-emerald-700" asChild>
                <Link href="/contact">Đặt lịch demo</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
