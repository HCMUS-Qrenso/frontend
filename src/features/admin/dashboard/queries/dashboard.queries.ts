/**
 * Dashboard Queries
 * React Query hooks for dashboard data
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api';

// ============================================
// Query Keys
// ============================================

export const dashboardKeys = {
  all: ['dashboard'] as const,
  todayStats: () => [...dashboardKeys.all, 'today-stats'] as const,
  recentOrders: (limit?: number) => [...dashboardKeys.all, 'recent-orders', limit] as const,
  performance: (range?: string, limit?: number) => [...dashboardKeys.all, 'performance', range, limit] as const,
  topItems: (limit?: number, date?: string) => [...dashboardKeys.all, 'top-items', limit, date] as const,
};

// ============================================
// Query Hooks
// ============================================

/**
 * Hook to get today's KPI statistics
 */
export function useTodayStatsQuery() {
  return useQuery({
    queryKey: dashboardKeys.todayStats(),
    queryFn: () => dashboardApi.getTodayStats(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

/**
 * Hook to get recent orders
 */
export function useRecentOrdersQuery(limit = 7) {
  return useQuery({
    queryKey: dashboardKeys.recentOrders(limit),
    queryFn: () => dashboardApi.getRecentOrders(limit),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

/**
 * Hook to get performance data for chart
 */
export function usePerformanceQuery(range: 'day' | 'week' | 'month' = 'day', limit = 11) {
  return useQuery({
    queryKey: dashboardKeys.performance(range, limit),
    queryFn: () => dashboardApi.getPerformance(range, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get top selling items
 */
export function useTopItemsQuery(limit = 6, date?: string) {
  return useQuery({
    queryKey: dashboardKeys.topItems(limit, date),
    queryFn: () => dashboardApi.getTopItems(limit, date),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000,
  });
}
