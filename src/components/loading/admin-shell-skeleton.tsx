'use client'

import { Skeleton, SkeletonText, SkeletonCircle } from '@/src/components/ui/skeleton'

/**
 * Skeleton for Admin Shell (sidebar + topbar + content area)
 * Used in app/admin/loading.tsx for route-level loading
 *
 * IMPORTANT: This skeleton should NOT wrap AdminLayout.
 * In App Router, loading.tsx already lives inside the parent layout.
 */
export function AdminShellSkeleton() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Skeleton */}
      <aside className="hidden w-64 border-r border-slate-200 bg-white p-4 lg:block dark:border-slate-800 dark:bg-slate-900">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-6 w-24" />
        </div>

        {/* Menu Items */}
        <nav className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg p-3">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="mt-auto pt-8">
          <div className="flex items-center gap-3 p-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Topbar Skeleton */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6 dark:border-slate-800 dark:bg-slate-900">
          {/* Left: Mobile menu + Tenant dropdown */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 lg:hidden" /> {/* Mobile menu */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-4" />
            </div>
          </div>

          {/* Right: Theme toggle + User avatar */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <SkeletonCircle className="h-9 w-9" />
          </div>
        </header>

        {/* Page Content Skeleton */}
        <main className="flex-1 p-4 lg:p-6">
          <PageContentSkeleton />
        </main>
      </div>
    </div>
  )
}

/**
 * Generic page content skeleton
 * Shows header + stats + table structure
 */
export function PageContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-2 h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <TableSkeleton />
    </div>
  )
}

/**
 * Table skeleton with header and rows
 */
interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
        <Skeleton className="h-10 w-64 rounded-lg" /> {/* Search */}
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      {/* Table Header */}
      <div className="flex gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/50">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 border-b border-slate-100 px-6 py-4 last:border-0 dark:border-slate-800"
        >
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-slate-200 p-4 dark:border-slate-800">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

/**
 * Stats cards skeleton
 */
interface StatsSkeletonProps {
  count?: number
}

export function StatsSkeleton({ count = 4 }: StatsSkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-2 h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

/**
 * Form page skeleton for settings/form pages
 * Shows 2-column grid of form cards
 */
export function FormPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Full width card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <Skeleton className="mb-4 h-6 w-40" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* 2x2 cards */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <Skeleton className="mb-4 h-6 w-40" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}

        {/* Full width card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <Skeleton className="mb-4 h-6 w-40" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

/**
 * KDS page skeleton
 * Shows toolbar + columns grid layout
 */
export function KdsPageSkeleton() {
  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-64 rounded-lg" />
      </div>

      {/* Columns grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((col) => (
          <div key={col} className="space-y-3">
            {/* Column header */}
            <div className="flex items-center justify-between rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            {/* Ticket cards */}
            {[1, 2].map((card) => (
              <div
                key={card}
                className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-3 flex items-center justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="mt-3 flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-lg" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Floor plan page skeleton
 * Shows toolbar + canvas + side panel layout
 */
export function FloorPlanSkeleton() {
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      {/* Main content: Canvas + Side Panel */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
        {/* Canvas */}
        <div className="flex min-h-[500px] items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="text-center">
            <Skeleton className="mx-auto h-16 w-16 rounded-lg" />
            <Skeleton className="mx-auto mt-4 h-4 w-32" />
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Table library */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <Skeleton className="mb-4 h-5 w-32" />
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </div>

          {/* Table details */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <Skeleton className="mb-4 h-5 w-40" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

