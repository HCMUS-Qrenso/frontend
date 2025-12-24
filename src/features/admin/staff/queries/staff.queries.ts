import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { staffApi } from '@/src/features/admin/staff/api/staff.api'
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

// Import and re-export query keys from dedicated keys file
export { staffQueryKeys } from './staff.keys'
import { staffQueryKeys } from './staff.keys'

// ============================================
// Query Hooks
// ============================================

// ============================================
// Query Hooks
// ============================================

/**
 * Get paginated list of staff with filtering
 */
export const useStaffQuery = (params?: StaffQueryParams, enabled = true) => {
  return useQuery<StaffListResponse>({
    queryKey: staffQueryKeys.list(params),
    queryFn: () => staffApi.getStaff(params),
    enabled,
  })
}

/**
 * Get staff statistics
 */
export const useStaffStatsQuery = (enabled = true) => {
  return useQuery<StaffStatsResponse>({
    queryKey: staffQueryKeys.stats(),
    queryFn: () => staffApi.getStats(),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Get single staff by ID
 */
export const useStaffDetailQuery = (id: string, enabled = true) => {
  return useQuery<Staff>({
    queryKey: staffQueryKeys.detail(id),
    queryFn: () => staffApi.getStaffById(id),
    enabled: enabled && !!id,
  })
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Create/invite new staff
 */
export const useCreateStaffMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<Staff, Error, CreateStaffPayload>({
    mutationFn: (payload) => staffApi.createStaff(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.stats() })
    },
  })
}

/**
 * Update staff member
 */
export const useUpdateStaffMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<Staff, Error, { id: string; payload: UpdateStaffPayload }>({
    mutationFn: ({ id, payload }) => staffApi.updateStaff(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.stats() })
    },
  })
}

/**
 * Delete staff member
 */
export const useDeleteStaffMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<MessageResponse, Error, string>({
    mutationFn: (id) => staffApi.deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.stats() })
    },
  })
}

/**
 * Update staff status only
 */
export const useUpdateStaffStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<Staff, Error, { id: string; payload: UpdateStatusPayload }>({
    mutationFn: ({ id, payload }) => staffApi.updateStatus(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.stats() })
    },
  })
}

/**
 * Send password reset email
 */
export const useResetPasswordMutation = () => {
  return useMutation<MessageResponse, Error, string>({
    mutationFn: (id) => staffApi.resetPassword(id),
  })
}

/**
 * Resend invite email
 */
export const useResendInviteMutation = () => {
  return useMutation<MessageResponse, Error, string>({
    mutationFn: (id) => staffApi.resendInvite(id),
  })
}
