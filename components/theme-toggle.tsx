'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun, Laptop } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

const themeOrder: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Calculate icon after all hooks are called
  const current = (mounted ? (theme ?? resolvedTheme ?? 'system') : 'system') as
    | 'light'
    | 'dark'
    | 'system'
  const icon =
    current === 'light' ? (
      <Sun className="h-5 w-5" />
    ) : current === 'dark' ? (
      <Moon className="h-5 w-5" />
    ) : (
      <Laptop className="h-5 w-5" />
    )

  if (!mounted) {
    // Return placeholder to avoid hydration mismatch
    return (
      <Button variant="ghost" size="icon" className="rounded-full" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  const handleToggle = () => {
    const idx = themeOrder.indexOf(current)
    const next = themeOrder[(idx + 1) % themeOrder.length]
    setTheme(next)
  }

  return (
    <Button variant="ghost" size="icon" className="rounded-full" onClick={handleToggle}>
      {icon}
    </Button>
  )
}
