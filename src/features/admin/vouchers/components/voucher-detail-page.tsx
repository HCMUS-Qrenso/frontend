'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter } from '@/src/i18n/navigation';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Edit,
  Percent,
  Tag,
  Users,
  Zap,
  Clock,
  TrendingUp,
  Archive,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  AdminTableContainer,
  AdminTableHeaderRow,
  AdminTableHead,
  AdminTableRow,
} from '@/src/components/ui/table';
import { StatusBadge, type StatusConfig } from '@/src/components/ui/status-badge';
import { EmptyState } from '@/src/components/ui/empty-state';
import { ContainerErrorState } from '@/src/components/ui/loading-state';
import { Skeleton } from '@/src/components/ui/skeleton';
import { useVoucherQuery, useVoucherRedemptionsQuery, useArchiveVoucherMutation } from '../queries';
import { VoucherFormDialog } from './voucher-form-dialog';
import { ConfirmDeleteDialog } from '@/src/components/ui/confirm-delete-dialog';
import type { ApplySource, VoucherStatus } from '../types';
import { useTenantSettings } from '@/src/contexts/tenant-settings-context';
import { useState } from 'react';
import { toast } from 'sonner';

interface VoucherDetailPageProps {
  id: string;
}

export function VoucherDetailPage({ id }: VoucherDetailPageProps) {
  const t = useTranslations('admin.vouchers');
  const router = useRouter();
  const { settings } = useTenantSettings();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const { data: voucherData, isLoading, isError } = useVoucherQuery(id);
  const { data: redemptionsData, isLoading: redemptionsLoading } = useVoucherRedemptionsQuery(id, 1, 20);
  const archiveMutation = useArchiveVoucherMutation();

  const voucher = voucherData?.data;

  // Helper to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: settings.general.currency || 'VND',
    }).format(value);
  };

  // Status config
  const voucherStatusConfig: Record<string, StatusConfig> = {
    active: {
      label: t('status.active'),
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    },
    draft: {
      label: t('status.draft'),
      className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
    },
    paused: {
      label: t('status.paused'),
      className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    },
    archived: {
      label: t('status.archived'),
      className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    },
  };

  const getKindIcon = (kind: string) => {
    const icons: Record<string, React.ReactNode> = {
      automatic: <Zap className="h-4 w-4" />,
      staff_only: <Users className="h-4 w-4" />,
      code: <Tag className="h-4 w-4" />,
    };
    return icons[kind];
  };

  const getKindLabel = (kind: string) => {
    const labels: Record<string, string> = {
      automatic: t('kind.automatic'),
      staff_only: t('kind.staffOnly'),
      code: t('kind.code'),
    };
    return labels[kind];
  };

  const getSourceLabel = (source: ApplySource) => {
    const labels: Record<ApplySource, string> = {
      auto: t('source.auto'),
      waiter: t('source.waiter'),
      customer_code: t('source.customerCode'),
      admin: t('source.admin'),
    };
    return labels[source];
  };

  const handleArchive = async () => {
    try {
      await archiveMutation.mutateAsync(id);
      toast.success(t('archiveSuccess'));
      router.push('/admin/vouchers');
    } catch {
      toast.error(t('archiveError'));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError || !voucher) {
    return <ContainerErrorState title={t('error.title')} description={t('error.loadFailed')} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/vouchers')}
            className="h-10 w-10 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-mono text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                {voucher.code}
              </h1>
              <StatusBadge status={voucher.status} config={voucherStatusConfig} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{voucher.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditOpen(true)}
            className="gap-2 rounded-lg"
          >
            <Edit className="h-4 w-4" />
            {t('actions.edit')}
          </Button>
          {voucher.status !== 'archived' && (
            <Button
              variant="outline"
              onClick={() => setIsArchiveOpen(true)}
              className="gap-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <Archive className="h-4 w-4" />
              {t('actions.archive')}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Discount */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              {voucher.discountType === 'percent' ? (
                <Percent className="h-5 w-5" />
              ) : (
                <DollarSign className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('detail.discountValue')}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {voucher.discountType === 'percent'
                  ? `${voucher.percentOff}%`
                  : formatCurrency(voucher.amountOff || 0)}
              </p>
              {voucher.maxDiscountAmount && (
                <p className="text-xs text-slate-500">
                  {t('detail.maxCap')}: {formatCurrency(voucher.maxDiscountAmount)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Usage */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('detail.timesUsed')}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {voucher.redemptionCount}
                {voucher.maxRedemptionsTotal && (
                  <span className="text-sm font-normal text-slate-500">
                    /{voucher.maxRedemptionsTotal}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Kind */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              {getKindIcon(voucher.kind)}
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('table.kind')}</p>
              <p className="text-lg font-medium text-slate-900 dark:text-white">
                {getKindLabel(voucher.kind)}
              </p>
            </div>
          </div>
        </div>

        {/* Validity */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('detail.validity')}</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {voucher.startsAt
                  ? format(new Date(voucher.startsAt), 'dd/MM/yyyy', { locale: vi })
                  : '∞'}
                {' - '}
                {voucher.endsAt
                  ? format(new Date(voucher.endsAt), 'dd/MM/yyyy', { locale: vi })
                  : '∞'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Voucher Info */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            {t('detail.discountInfo')}
          </h2>
          <dl className="space-y-4">
            {voucher.description && (
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">{t('form.description')}</dt>
                <dd className="text-sm text-slate-900 dark:text-white">{voucher.description}</dd>
              </div>
            )}
            {voucher.minSubtotal && (
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">{t('detail.minOrder')}</dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-white">
                  {formatCurrency(voucher.minSubtotal)}
                </dd>
              </div>
            )}
            {voucher.minParty && (
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">{t('form.minParty')}</dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-white">
                  {voucher.minParty} {t('detail.people')}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">{t('form.priority')}</dt>
              <dd className="text-sm font-medium text-slate-900 dark:text-white">{voucher.priority}</dd>
            </div>
            <div className="flex gap-4">
              {voucher.autoApply && (
                <Badge variant="outline" className="gap-1">
                  <Zap className="h-3 w-3" />
                  {t('form.autoApply')}
                </Badge>
              )}
              {voucher.isPublic && (
                <Badge variant="outline" className="gap-1">
                  {t('form.isPublic')}
                </Badge>
              )}
            </div>
          </dl>
        </div>

        {/* Time Info */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            {t('detail.validity')}
          </h2>
          <dl className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-slate-400" />
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">{t('detail.startsAt')}</dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-white">
                  {voucher.startsAt
                    ? format(new Date(voucher.startsAt), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })
                    : t('detail.noLimit')}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-slate-400" />
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">{t('detail.endsAt')}</dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-white">
                  {voucher.endsAt
                    ? format(new Date(voucher.endsAt), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })
                    : t('detail.noLimit')}
                </dd>
              </div>
            </div>
            {voucher.maxRedemptionsPerCustomer && (
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">
                  {t('form.maxRedemptionsPerCustomer')}
                </dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-white">
                  {voucher.maxRedemptionsPerCustomer} lần/khách
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Redemption History */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-6 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t('detail.recentRedemptions')}
          </h2>
        </div>
        <AdminTableContainer className="border-0">
          <Table>
            <TableHeader>
              <AdminTableHeaderRow>
                <AdminTableHead>{t('detail.orderNumber')}</AdminTableHead>
                <AdminTableHead>{t('detail.discountAmount')}</AdminTableHead>
                <AdminTableHead>{t('detail.source')}</AdminTableHead>
                <AdminTableHead>{t('detail.time')}</AdminTableHead>
              </AdminTableHeaderRow>
            </TableHeader>
            <TableBody>
              {redemptionsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  </TableRow>
                ))
              ) : redemptionsData?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-6 py-0">
                    <EmptyState
                      icon={TrendingUp}
                      title={t('detail.noRedemptions')}
                      description={t('detail.noRedemptionsDescription')}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                redemptionsData?.data.map((redemption, index) => (
                  <AdminTableRow key={redemption.id} isLast={index === redemptionsData.data.length - 1}>
                    <TableCell className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                        {redemption.orderNumber}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        -{formatCurrency(redemption.discountAmount)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge variant="outline" className="text-xs">
                        {getSourceLabel(redemption.source)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {format(new Date(redemption.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </span>
                    </TableCell>
                  </AdminTableRow>
                ))
              )}
            </TableBody>
          </Table>
        </AdminTableContainer>
      </div>

      {/* Edit Dialog */}
      <VoucherFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        voucher={voucher}
      />

      {/* Archive Dialog */}
      <ConfirmDeleteDialog
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
        title={t('archiveDialog.title')}
        description={t('archiveDialog.description', { code: voucher.code })}
        onConfirm={handleArchive}
        isLoading={archiveMutation.isPending}
      />
    </div>
  );
}
