import { apiClient } from '@/src/lib/axios'
import type {
  Staff,
  StaffQueryParams,
  StaffListResponse,
  StaffStatsResponse,
  CreateStaffPayload,
  UpdateStaffPayload,
  UpdateStatusPayload,
} from '@/src/features/admin/staff/types/staff'
import type { MessageResponse } from '@/src/features/auth/types/auth'

export const staffApi = {
  /**
   * Get paginated list of staff with filtering
   * GET /staff
   */
  getStaff: async (params?: StaffQueryParams): Promise<StaffListResponse> => {
    const { data } = await apiClient.get<StaffListResponse>('/staff', { params })
    return data
  },

  /**
   * Get staff statistics by role and status
   * GET /staff/stats
   */
  getStats: async (): Promise<StaffStatsResponse> => {
    const { data } = await apiClient.get<StaffStatsResponse>('/staff/stats')
    return data
  },

  /**
   * Get staff member by ID
   * GET /staff/:id
   */
  getStaffById: async (id: string): Promise<Staff> => {
    const { data } = await apiClient.get<Staff>(`/staff/${id}`)
    return data
  },

  /**
   * Create/invite a new staff member
   * POST /staff
   */
  createStaff: async (payload: CreateStaffPayload): Promise<Staff> => {
    const { data } = await apiClient.post<Staff>('/staff', payload)
    return data
  },

  /**
   * Update staff member
   * PUT /staff/:id
   */
  updateStaff: async (id: string, payload: UpdateStaffPayload): Promise<Staff> => {
    const { data } = await apiClient.put<Staff>(`/staff/${id}`, payload)
    return data
  },

  /**
   * Delete staff member
   * DELETE /staff/:id
   */
  deleteStaff: async (id: string): Promise<MessageResponse> => {
    const { data } = await apiClient.delete<MessageResponse>(`/staff/${id}`)
    return data
  },

  /**
   * Update staff status only
   * PATCH /staff/:id/status
   */
  updateStatus: async (id: string, payload: UpdateStatusPayload): Promise<Staff> => {
    const { data } = await apiClient.patch<Staff>(`/staff/${id}/status`, payload)
    return data
  },

  /**
   * Send password reset email to staff
   * POST /staff/:id/reset-password
   */
  resetPassword: async (id: string): Promise<MessageResponse> => {
    const { data } = await apiClient.post<MessageResponse>(`/staff/${id}/reset-password`)
    return data
  },

  /**
   * Resend invite email to staff
   * POST /staff/:id/resend-invite
   */
  resendInvite: async (id: string): Promise<MessageResponse> => {
    const { data } = await apiClient.post<MessageResponse>(`/staff/${id}/resend-invite`)
    return data
  },
}
