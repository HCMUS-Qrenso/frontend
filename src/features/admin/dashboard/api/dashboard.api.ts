/**
 * Dashboard API
 * API client for dashboard endpoints
 */

import { apiClient } from '@/src/lib/axios';

// ============================================
// Types
// ============================================

export interface OrderStatusBreakdown {
  pending: number;
  accepted: number;
  in_progress: number;
  preparing: number;
  ready: number;
  served: number;
  completed: number;
}

export interface TodayStatsData {
  orders_today: number;
  orders_yesterday: number;
  orders_change_percent: number;
  revenue_today: number;
  revenue_yesterday: number;
  revenue_change_percent: number;
  avg_order_value: number;
  tables_occupied: number;
  tables_available: number;
  tables_total: number;
  avg_service_time_minutes: number;
  order_status_breakdown: OrderStatusBreakdown;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  table_number: string;
  created_at: string;
  total_amount: number;
  status: string;
}

export interface PerformanceDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface PerformanceSummary {
  total_revenue: number;
  total_orders: number;
  growth_percentage: number;
  avg_orders_per_period: number;
}

export interface PerformanceData {
  data: PerformanceDataPoint[];
  summary: PerformanceSummary;
}

export interface TopItem {
  id: string;
  name: string;
  image_url: string | null;
  quantity_sold: number;
  revenue: number;
}

// ============================================
// API Functions
// ============================================

export const dashboardApi = {
  /**
   * Get today's KPI statistics
   */
  getTodayStats: async (): Promise<TodayStatsData> => {
    const { data } = await apiClient.get<{ success: boolean; data: TodayStatsData }>(
      '/dashboard/today-stats'
    );
    return data.data;
  },

  /**
   * Get recent orders
   */
  getRecentOrders: async (limit = 7): Promise<RecentOrder[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: { orders: RecentOrder[] } }>(
      '/dashboard/recent-orders',
      { params: { limit } }
    );
    return data.data.orders;
  },

  /**
   * Get performance data for chart
   */
  getPerformance: async (
    range: 'day' | 'week' | 'month' = 'day',
    limit = 11
  ): Promise<PerformanceData> => {
    const { data } = await apiClient.get<{ success: boolean; data: PerformanceData }>(
      '/dashboard/performance',
      { params: { range, limit } }
    );
    return data.data;
  },

  /**
   * Get top selling items
   */
  getTopItems: async (limit = 6, date?: string): Promise<TopItem[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: { items: TopItem[] } }>(
      '/dashboard/top-items',
      { params: { limit, date } }
    );
    return data.data.items;
  },
};
