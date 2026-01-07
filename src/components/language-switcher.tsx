'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/src/i18n/navigation'
import { locales, localeNames, type Locale } from '@/src/i18n/config'
import { cn } from '@/src/lib/utils'
import { Button } from '@/src/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/src/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'

const languages = locales.map((loc) => ({
  value: loc,
  label: localeNames[loc],
}))

export function LanguageSwitcher() {
  const [open, setOpen] = React.useState(false)
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleSelect = (currentValue: string) => {
    if (currentValue !== locale) {
      router.replace(pathname, { locale: currentValue as Locale })
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[140px] justify-between"
        >
          {locale ? languages.find((lang) => lang.value === locale)?.label : 'Select language...'}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[140px] p-0">
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {languages.map((lang) => (
                <CommandItem key={lang.value} value={lang.value} onSelect={handleSelect}>
                  {lang.label}
                  <Check
                    className={cn('ml-auto', locale === lang.value ? 'opacity-100' : 'opacity-0')}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
