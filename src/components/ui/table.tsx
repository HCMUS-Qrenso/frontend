'use client'

import * as React from 'react'

import { cn } from '@/src/lib/utils'

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn('[&_tr]:border-b', className)} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors',
        className,
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('text-muted-foreground mt-4 text-sm', className)}
      {...props}
    />
  )
}

// =============================================================================
// Admin Styled Variants
// Pre-styled components for consistent admin table appearance
// =============================================================================

/**
 * Container wrapper for admin tables with rounded borders and shadow
 */
function AdminTableContainer({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Header row with admin styling (slate background, no hover change)
 */
function AdminTableHeaderRow({
  className,
  ...props
}: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b border-slate-100 bg-slate-50/80 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
      {...props}
    />
  )
}

interface AdminTableHeadProps extends React.ComponentProps<'th'> {
  align?: 'left' | 'center' | 'right'
}

/**
 * Table header cell with admin styling (uppercase, tracking-wide)
 */
function AdminTableHead({
  className,
  align = 'left',
  ...props
}: AdminTableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'px-6 py-3 text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400',
        align === 'left' && 'text-left',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className,
      )}
      {...props}
    />
  )
}

interface AdminTableRowProps extends React.ComponentProps<'tr'> {
  isLast?: boolean
}

/**
 * Data row with admin styling (hover state, border)
 */
function AdminTableRow({
  className,
  isLast = false,
  ...props
}: AdminTableRowProps) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800',
        isLast && 'border-b-0',
        className,
      )}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  // Admin styled variants
  AdminTableContainer,
  AdminTableHeaderRow,
  AdminTableHead,
  AdminTableRow,
}
