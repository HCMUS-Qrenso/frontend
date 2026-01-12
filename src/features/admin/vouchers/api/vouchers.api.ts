import { apiClient } from '@/src/lib/axios'
import type {
  Voucher,
  VoucherQueryParams,
  VoucherListResponse,
  VoucherResponse,
  RedemptionListResponse,
  CreateVoucherPayload,
  UpdateVoucherPayload,
} from '../types'
import type { MessageResponse } from '@/src/types/common'

export const vouchersApi = {
  /**
   * Get paginated list of vouchers with filtering
   * GET /vouchers
   */
  getVouchers: async (params?: VoucherQueryParams): Promise<VoucherListResponse> => {
    const { data } = await apiClient.get<VoucherListResponse>('/vouchers', { params })
    return data
  },

  /**
   * Get voucher by ID
   * GET /vouchers/:id
   */
  getVoucherById: async (id: string): Promise<VoucherResponse> => {
    const { data } = await apiClient.get<VoucherResponse>(`/vouchers/${id}`)
    return data
  },

  /**
   * Create a new voucher
   * POST /vouchers
   */
  createVoucher: async (payload: CreateVoucherPayload): Promise<VoucherResponse> => {
    const { data } = await apiClient.post<VoucherResponse>('/vouchers', payload)
    return data
  },

  /**
   * Update voucher
   * PATCH /vouchers/:id
   */
  updateVoucher: async (id: string, payload: UpdateVoucherPayload): Promise<VoucherResponse> => {
    const { data } = await apiClient.patch<VoucherResponse>(`/vouchers/${id}`, payload)
    return data
  },

  /**
   * Archive voucher
   * DELETE /vouchers/:id
   */
  archiveVoucher: async (id: string): Promise<MessageResponse> => {
    const { data } = await apiClient.delete<MessageResponse>(`/vouchers/${id}`)
    return data
  },

  /**
   * Get voucher redemption history
   * GET /vouchers/:id/redemptions
   */
  getRedemptions: async (
    id: string,
    params?: { page?: number; limit?: number },
  ): Promise<RedemptionListResponse> => {
    const { data } = await apiClient.get<RedemptionListResponse>(`/vouchers/${id}/redemptions`, {
      params,
    })
    return data
  },

  /**
   * Get staff-only vouchers for waiter
   * GET /vouchers/staff-available
   */
  getStaffVouchers: async (): Promise<VoucherListResponse> => {
    const { data } = await apiClient.get<VoucherListResponse>('/vouchers/staff-available')
    return data
  },
}
