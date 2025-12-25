import { AdminShellSkeleton } from '@/src/components/loading'

/**
 * Route-level loading for all /admin/* routes
 *
 * This skeleton covers:
 * - Sidebar
 * - Topbar
 * - Content area with stats + table skeleton
 *
 * IMPORTANT: Do NOT wrap this in AdminLayout.
 * In App Router, loading.tsx already lives inside the parent layout.
 */
export default function AdminLoading() {
  return <AdminShellSkeleton />
}
