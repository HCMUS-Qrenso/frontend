import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vouchersApi } from '../api';
import type { VoucherQueryParams, CreateVoucherPayload, UpdateVoucherPayload } from '../types';
import { toast } from 'sonner';

// Query Keys
export const voucherKeys = {
  all: ['vouchers'] as const,
  lists: () => [...voucherKeys.all, 'list'] as const,
  list: (params: VoucherQueryParams) => [...voucherKeys.lists(), params] as const,
  details: () => [...voucherKeys.all, 'detail'] as const,
  detail: (id: string) => [...voucherKeys.details(), id] as const,
  redemptions: (id: string) => [...voucherKeys.all, 'redemptions', id] as const,
  staffAvailable: () => [...voucherKeys.all, 'staff-available'] as const,
};

// Queries
export function useVouchersQuery(params?: VoucherQueryParams) {
  return useQuery({
    queryKey: voucherKeys.list(params || {}),
    queryFn: () => vouchersApi.getVouchers(params),
  });
}

export function useVoucherQuery(id: string) {
  return useQuery({
    queryKey: voucherKeys.detail(id),
    queryFn: () => vouchersApi.getVoucherById(id),
    enabled: !!id,
  });
}

export function useVoucherRedemptionsQuery(id: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: [...voucherKeys.redemptions(id), page, limit],
    queryFn: () => vouchersApi.getRedemptions(id, { page, limit }),
    enabled: !!id,
  });
}

export function useStaffVouchersQuery() {
  return useQuery({
    queryKey: voucherKeys.staffAvailable(),
    queryFn: () => vouchersApi.getStaffVouchers(),
  });
}

// Mutations
export function useCreateVoucherMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVoucherPayload) => vouchersApi.createVoucher(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
      toast.success('Tạo voucher thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể tạo voucher');
    },
  });
}

export function useUpdateVoucherMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVoucherPayload }) =>
      vouchersApi.updateVoucher(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
      queryClient.invalidateQueries({ queryKey: voucherKeys.detail(id) });
      toast.success('Cập nhật voucher thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể cập nhật voucher');
    },
  });
}

export function useArchiveVoucherMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vouchersApi.archiveVoucher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
      toast.success('Voucher đã được lưu trữ');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể lưu trữ voucher');
    },
  });
}
