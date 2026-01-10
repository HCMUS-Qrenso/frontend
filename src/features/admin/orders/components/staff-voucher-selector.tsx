'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import {
  Ticket,
  Tag,
  Loader2,
  X,
  Check,
  Search,
  Percent,
  DollarSign,
  Users,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover';
import { Badge } from '@/src/components/ui/badge';
import { Separator } from '@/src/components/ui/separator';
import { useStaffVouchersQuery } from '@/src/features/admin/vouchers/queries';
import { ordersApi } from '../api';
import { ordersQueryKeys } from '../queries';
import type { Voucher } from '@/src/features/admin/vouchers/types';
import { toast } from 'sonner';

interface StaffVoucherSelectorProps {
  orderId: string;
  orderSubtotal: number;
  appliedVoucher?: {
    redemptionId: string;
    code: string;
    name: string;
    discountAmount: number;
  } | null;
  onVoucherApplied?: (discountAmount: number) => void;
  onVoucherRemoved?: () => void;
  disabled?: boolean;
}

/**
 * Staff voucher selector component for waiter/admin to apply vouchers on orders
 */
export function StaffVoucherSelector({
  orderId,
  orderSubtotal,
  appliedVoucher,
  onVoucherApplied,
  onVoucherRemoved,
  disabled = false,
}: StaffVoucherSelectorProps) {
  const t = useTranslations('admin.vouchers');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [applyingCode, setApplyingCode] = useState(false);

  const { data, isLoading, refetch } = useStaffVouchersQuery();
  const queryClient = useQueryClient();
  const vouchers = data?.data || [];

  // Filter vouchers by search
  const filteredVouchers = vouchers.filter(
    (v) =>
      v.code.toLowerCase().includes(search.toLowerCase()) ||
      v.name.toLowerCase().includes(search.toLowerCase())
  );

  // Check if voucher is eligible based on minimum subtotal
  const isEligible = (voucher: Voucher) => {
    if (voucher.minSubtotal && orderSubtotal < voucher.minSubtotal) {
      return false;
    }
    return true;
  };

  // Calculate estimated discount
  const estimateDiscount = (voucher: Voucher) => {
    if (voucher.discountType === 'percent') {
      const discount = orderSubtotal * ((voucher.percentOff || 0) / 100);
      if (voucher.maxDiscountAmount && discount > voucher.maxDiscountAmount) {
        return voucher.maxDiscountAmount;
      }
      return discount;
    }
    return voucher.amountOff || 0;
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  // Apply voucher by ID
  const handleApplyVoucher = async (voucherId: string) => {
    setApplyingId(voucherId);
    try {
      const result = await ordersApi.applyVoucher(orderId, voucherId);
      toast.success(t('applySuccess'));
      setIsOpen(false);
      // Invalidate order queries to refresh data
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.lists() });
      onVoucherApplied?.(result.data.discountAmount);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('applyError'));
    } finally {
      setApplyingId(null);
    }
  };

  // Apply voucher by code - find voucher first then apply
  const handleApplyCode = async () => {
    if (!codeInput.trim()) return;
    
    setApplyingCode(true);
    try {
      // Find voucher by code in the list
      const voucher = vouchers.find(v => v.code.toLowerCase() === codeInput.toLowerCase());
      if (!voucher) {
        toast.error(t('invalidCode'));
        setApplyingCode(false);
        return;
      }
      
      const result = await ordersApi.applyVoucher(orderId, voucher.id);
      toast.success(t('applySuccess'));
      setIsOpen(false);
      setCodeInput('');
      // Invalidate order queries to refresh data
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.lists() });
      onVoucherApplied?.(result.data.discountAmount);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('applyError'));
    } finally {
      setApplyingCode(false);
    }
  };

  // Remove applied voucher
  const handleRemoveVoucher = async () => {
    if (!appliedVoucher) return;
    
    setRemoving(true);
    try {
      await ordersApi.revokeVoucher(orderId, appliedVoucher.redemptionId, 'Removed by staff');
      toast.success(t('revokeSuccess'));
      // Invalidate order queries to refresh data
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.lists() });
      onVoucherRemoved?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('revokeError'));
    } finally {
      setRemoving(false);
    }
  };

  // If voucher is already applied, show badge
  if (appliedVoucher) {
    return (
      <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="flex items-center gap-2 flex-1">
          <Ticket className="h-4 w-4 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {appliedVoucher.name}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              {appliedVoucher.code} • -{formatCurrency(appliedVoucher.discountAmount)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemoveVoucher}
          disabled={disabled || removing}
          className="text-green-700 hover:text-red-600 hover:bg-red-50"
        >
          {removing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="gap-2"
        >
          <Tag className="h-4 w-4" />
          {t('actions.applyVoucher')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b">
          <h4 className="font-medium text-sm">{t('staffSelector.title')}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            {t('staffSelector.subtitle')}
          </p>
        </div>

        {/* Search */}
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('staffSelector.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8"
            />
          </div>
        </div>

        {/* Voucher list */}
        <div className="h-[200px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {t('staffSelector.noVouchers')}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredVouchers.map((voucher) => {
                const eligible = isEligible(voucher);
                const discount = estimateDiscount(voucher);

                return (
                  <button
                    key={voucher.id}
                    onClick={() => eligible && handleApplyVoucher(voucher.id)}
                    disabled={!eligible || applyingId !== null}
                    className={`
                      w-full text-left p-2 rounded-md transition-colors
                      ${eligible
                        ? 'hover:bg-muted cursor-pointer'
                        : 'opacity-50 cursor-not-allowed bg-muted/50'}
                    `}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          {voucher.discountType === 'percent' ? (
                            <Percent className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className="font-medium text-sm">
                            {voucher.discountType === 'percent'
                              ? `${voucher.percentOff}%`
                              : formatCurrency(voucher.amountOff || 0)}
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1 py-0">
                            {voucher.code}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {voucher.name}
                        </p>
                        {voucher.minSubtotal && (
                          <div className="flex items-center gap-1 mt-1">
                            <ShoppingBag className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">
                              Đơn từ {formatCurrency(voucher.minSubtotal)}
                            </span>
                          </div>
                        )}
                      </div>
                      {eligible && (
                        <div className="text-right shrink-0">
                          <p className="text-xs font-medium text-green-600">
                            -{formatCurrency(discount)}
                          </p>
                          {applyingId === voucher.id && (
                            <Loader2 className="h-3 w-3 animate-spin mx-auto mt-1" />
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Separator />

        {/* Manual code input */}
        <div className="p-2">
          <p className="text-xs text-muted-foreground mb-2">
            {t('staffSelector.orEnterCode')}
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="CODE"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              className="uppercase h-8"
            />
            <Button
              size="sm"
              onClick={handleApplyCode}
              disabled={!codeInput.trim() || applyingCode}
            >
              {applyingCode ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
