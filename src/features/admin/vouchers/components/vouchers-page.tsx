'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/src/i18n/navigation';
import {
  MoreVertical,
  Pencil,
  Archive,
  Eye,
  Tag,
  Percent,
  DollarSign,
  Users,
  Zap,
  Ticket,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { StatusBadge, type StatusConfig } from '@/src/components/ui/status-badge';
import { EmptyState } from '@/src/components/ui/empty-state';
import { ContainerErrorState } from '@/src/components/ui/loading-state';
import { SkeletonTableRows } from '@/src/components/loading';
import { TablePagination } from '@/src/components/ui/table-pagination';
import { useVouchersQuery, useArchiveVoucherMutation } from '../queries';
import { VoucherFormDialog } from './voucher-form-dialog';
import { VouchersFilterToolbar } from './vouchers-filter-toolbar';
import { ConfirmDeleteDialog } from '@/src/components/ui/confirm-delete-dialog';
import type { Voucher, VoucherStatus, VoucherKind } from '../types';
import { useTenantSettings } from '@/src/contexts/tenant-settings-context';

export function VouchersPage() {
  const t = useTranslations('vouchers');
  const router = useRouter();
  const { settings } = useTenantSettings();

  // Helper to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: settings.general.currency || 'VND',
    }).format(value);
  };

  // Create status config for StatusBadge
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

  // State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VoucherStatus | 'all'>('all');
  const [kindFilter, setKindFilter] = useState<VoucherKind | 'all'>('all');
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [deletingVoucher, setDeletingVoucher] = useState<Voucher | null>(null);

  const limit = 10;

  // Query
  const { data, isLoading, isError } = useVouchersQuery({
    page,
    limit,
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    kind: kindFilter !== 'all' ? kindFilter : undefined,
  });

  const vouchers = data?.data || [];
  const meta = data?.meta;

  const archiveMutation = useArchiveVoucherMutation();

  // Helpers
  const getKindIcon = (kind: VoucherKind) => {
    const icons: Record<VoucherKind, React.ReactNode> = {
      automatic: <Zap className="h-3 w-3" />,
      staff_only: <Users className="h-3 w-3" />,
      code: <Tag className="h-3 w-3" />,
    };
    return icons[kind];
  };

  const getKindLabel = (kind: VoucherKind) => {
    const labels: Record<VoucherKind, string> = {
      automatic: t('kind.automatic'),
      staff_only: t('kind.staffOnly'),
      code: t('kind.code'),
    };
    return labels[kind];
  };

  const formatDiscount = (voucher: Voucher) => {
    if (voucher.discountType === 'percent') {
      return `${voucher.percentOff}%`;
    }
    return formatCurrency(voucher.amountOff || 0);
  };

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingVoucher(null);
    setIsFormOpen(true);
  };

  const handleArchive = async () => {
    if (deletingVoucher) {
      await archiveMutation.mutateAsync(deletingVoucher.id);
      setDeletingVoucher(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isError) {
    return <ContainerErrorState title={t('error.title')} description={t('error.loadFailed')} />;
  }

  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <VouchersFilterToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        kindFilter={kindFilter}
        onKindChange={setKindFilter}
        onCreate={handleCreate}
      />

      {/* Table */}
      <AdminTableContainer>
        <Table className="w-full table-fixed">
          <colgroup>
            <col className="w-[15%]" />
            <col className="w-[25%]" />
            <col className="w-[12%]" />
            <col className="w-[15%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[9%]" />
          </colgroup>
          <TableHeader>
            <AdminTableHeaderRow>
              <AdminTableHead>{t('table.code')}</AdminTableHead>
              <AdminTableHead>{t('table.name')}</AdminTableHead>
              <AdminTableHead>{t('table.discount')}</AdminTableHead>
              <AdminTableHead>{t('table.kind')}</AdminTableHead>
              <AdminTableHead>{t('table.status')}</AdminTableHead>
              <AdminTableHead align="right">{t('table.usage')}</AdminTableHead>
              <AdminTableHead align="right">{t('table.actions')}</AdminTableHead>
            </AdminTableHeaderRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonTableRows
                rowCount={5}
                columns={[
                  { type: 'text' },
                  { type: 'text-with-subtext' },
                  { type: 'text' },
                  { type: 'badge' },
                  { type: 'badge' },
                  { type: 'number', align: 'right' },
                  { type: 'actions', align: 'right', actionCount: 1 },
                ]}
              />
            ) : vouchers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-6 py-0">
                  <EmptyState
                    icon={Ticket}
                    title={t('table.emptyTitle')}
                    description={t('table.emptyDescription')}
                  />
                </TableCell>
              </TableRow>
            ) : (
              vouchers.map((voucher, index) => (
                <AdminTableRow
                  key={voucher.id}
                  isLast={index === vouchers.length - 1}
                  onClick={() => router.push(`/admin/vouchers/${voucher.id}`)}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <TableCell className="px-6 py-4">
                    <p className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                      {voucher.code}
                    </p>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {voucher.name}
                      </p>
                      {voucher.description && (
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400 max-w-[200px]">
                          {voucher.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {voucher.discountType === 'percent' ? (
                        <Percent className="h-3 w-3 text-slate-500" />
                      ) : (
                        <DollarSign className="h-3 w-3 text-slate-500" />
                      )}
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {formatDiscount(voucher)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">{getKindIcon(voucher.kind)}</span>
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {getKindLabel(voucher.kind)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <StatusBadge status={voucher.status} config={voucherStatusConfig} />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {voucher.redemptionCount}
                    </span>
                    {voucher.maxRedemptionsTotal && (
                      <span className="text-sm text-slate-500">/{voucher.maxRedemptionsTotal}</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => router.push(`/admin/vouchers/${voucher.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t('actions.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(voucher)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t('actions.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingVoucher(voucher)}
                            className="text-red-600 focus:text-red-600 dark:text-red-400"
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            {t('actions.archive')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </AdminTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminTableContainer>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <TablePagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={limit}
          itemLabel={t('table.voucherLabel')}
          onPageChange={handlePageChange}
        />
      )}

      {/* Dialogs */}
      <VoucherFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        voucher={editingVoucher}
      />

      <ConfirmDeleteDialog
        open={!!deletingVoucher}
        onOpenChange={(open: boolean) => !open && setDeletingVoucher(null)}
        title={t('archiveDialog.title')}
        description={t('archiveDialog.description', { code: deletingVoucher?.code || '' })}
        onConfirm={handleArchive}
        isLoading={archiveMutation.isPending}
      />
    </div>
  );
}
