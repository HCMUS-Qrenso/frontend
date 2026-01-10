'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  FormDialog,
  FormDialogField,
  FormDialogSection,
  FormDialogSectionGroup,
  FormDialogDivider,
} from '@/src/components/ui/form-dialog';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { Switch } from '@/src/components/ui/switch';
import { Label } from '@/src/components/ui/label';
import { useCreateVoucherMutation, useUpdateVoucherMutation } from '../queries';
import { useErrorHandler } from '@/src/hooks/use-error-handler';
import { toast } from 'sonner';
import type { Voucher, VoucherKind, DiscountType, VoucherStatus } from '../types';

interface VoucherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: Voucher | null;
}

const initialFormData = {
  code: '',
  name: '',
  description: '',
  kind: 'automatic' as VoucherKind,
  discountType: 'percent' as DiscountType,
  percentOff: 10,
  amountOff: 0,
  maxDiscountAmount: undefined as number | undefined,
  minSubtotal: undefined as number | undefined,
  minParty: undefined as number | undefined,
  startsAt: '',
  endsAt: '',
  maxRedemptionsTotal: undefined as number | undefined,
  maxRedemptionsPerCustomer: undefined as number | undefined,
  autoApply: false,
  isPublic: false,
  priority: 0,
  status: 'draft' as VoucherStatus,
};

export function VoucherFormDialog({ open, onOpenChange, voucher }: VoucherFormDialogProps) {
  const t = useTranslations('admin.vouchers');
  const isEditing = !!voucher;
  const { handleError } = useErrorHandler();

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateVoucherMutation();
  const updateMutation = useUpdateVoucherMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Load data if editing
  useEffect(() => {
    if (voucher) {
      setFormData({
        code: voucher.code,
        name: voucher.name,
        description: voucher.description || '',
        kind: voucher.kind,
        discountType: voucher.discountType,
        percentOff: voucher.percentOff || 10,
        amountOff: voucher.amountOff || 0,
        maxDiscountAmount: voucher.maxDiscountAmount || undefined,
        minSubtotal: voucher.minSubtotal || undefined,
        minParty: voucher.minParty || undefined,
        startsAt: voucher.startsAt ? voucher.startsAt.split('T')[0] : '',
        endsAt: voucher.endsAt ? voucher.endsAt.split('T')[0] : '',
        maxRedemptionsTotal: voucher.maxRedemptionsTotal || undefined,
        maxRedemptionsPerCustomer: voucher.maxRedemptionsPerCustomer || undefined,
        autoApply: voucher.autoApply,
        isPublic: voucher.isPublic,
        priority: voucher.priority,
        status: voucher.status,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [voucher, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Mã voucher không được để trống';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Tên voucher không được để trống';
    }
    if (formData.discountType === 'percent' && (!formData.percentOff || formData.percentOff <= 0 || formData.percentOff > 100)) {
      newErrors.percentOff = 'Phần trăm giảm phải từ 1 đến 100';
    }
    if (formData.discountType === 'fixed_amount' && (!formData.amountOff || formData.amountOff <= 0)) {
      newErrors.amountOff = 'Số tiền giảm phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      code: formData.code.toUpperCase(),
      name: formData.name,
      description: formData.description || undefined,
      kind: formData.kind,
      discountType: formData.discountType,
      percentOff: formData.discountType === 'percent' ? formData.percentOff : undefined,
      amountOff: formData.discountType === 'fixed_amount' ? formData.amountOff : undefined,
      maxDiscountAmount: formData.maxDiscountAmount || undefined,
      minSubtotal: formData.minSubtotal || undefined,
      minParty: formData.minParty || undefined,
      startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : undefined,
      endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : undefined,
      maxRedemptionsTotal: formData.maxRedemptionsTotal || undefined,
      maxRedemptionsPerCustomer: formData.maxRedemptionsPerCustomer || undefined,
      autoApply: formData.autoApply,
      isPublic: formData.isPublic,
      priority: formData.priority,
      status: formData.status,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: voucher.id, payload });
        toast.success('Cập nhật voucher thành công');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Tạo voucher thành công');
      }
      onOpenChange(false);
    } catch (error) {
      handleError(error, isEditing ? 'Không thể cập nhật voucher' : 'Không thể tạo voucher');
    }
  };

  const updateField = <K extends keyof typeof formData>(field: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? t('form.editTitle') : t('form.createTitle')}
      description={isEditing ? t('form.editDescription') : t('form.createDescription')}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitText={isEditing ? t('form.save') : t('form.create')}
      loadingText={t('form.saving')}
      size="xl"
      scrollable
    >
      {/* Section 1: Thông tin cơ bản */}
      <FormDialogSectionGroup title={t('form.tabs.basic')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormDialogField label={t('form.code')} required error={errors.code}>
            <Input
              value={formData.code}
              onChange={(e) => updateField('code', e.target.value.toUpperCase())}
              placeholder="KHAITRUONG2026"
              className="uppercase"
              disabled={isSubmitting}
            />
          </FormDialogField>

          <FormDialogField label={t('form.status')}>
            <Select
              value={formData.status}
              onValueChange={(v: VoucherStatus) => updateField('status', v)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">{t('status.draft')}</SelectItem>
                <SelectItem value="active">{t('status.active')}</SelectItem>
                <SelectItem value="paused">{t('status.paused')}</SelectItem>
              </SelectContent>
            </Select>
          </FormDialogField>
        </div>

        <FormDialogField label={t('form.name')} required error={errors.name}>
          <Input
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder={t('form.namePlaceholder')}
            disabled={isSubmitting}
          />
        </FormDialogField>

        <FormDialogField label={t('form.description')}>
          <Textarea
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder={t('form.descriptionPlaceholder')}
            rows={2}
            disabled={isSubmitting}
          />
        </FormDialogField>

        <FormDialogField label={t('form.kind')} hint={t(`form.kindDescription.${formData.kind}`)}>
          <Select
            value={formData.kind}
            onValueChange={(v: VoucherKind) => updateField('kind', v)}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="automatic">{t('kind.automatic')}</SelectItem>
              <SelectItem value="staff_only">{t('kind.staffOnly')}</SelectItem>
              <SelectItem value="code">{t('kind.code')}</SelectItem>
            </SelectContent>
          </Select>
        </FormDialogField>
      </FormDialogSectionGroup>

      <FormDialogDivider />

      {/* Section 2: Giảm giá */}
      <FormDialogSectionGroup title={t('form.tabs.discount')}>
        <FormDialogField label={t('form.discountType')}>
          <Select
            value={formData.discountType}
            onValueChange={(v: DiscountType) => updateField('discountType', v)}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percent">{t('discountType.percent')}</SelectItem>
              <SelectItem value="fixed_amount">{t('discountType.fixedAmount')}</SelectItem>
            </SelectContent>
          </Select>
        </FormDialogField>

        {formData.discountType === 'percent' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormDialogField label={t('form.percentOff')} error={errors.percentOff}>
              <Input
                type="number"
                value={formData.percentOff || ''}
                onChange={(e) => updateField('percentOff', e.target.value ? Number(e.target.value) : 0)}
                min={0}
                max={100}
                disabled={isSubmitting}
              />
            </FormDialogField>

            <FormDialogField label={t('form.maxDiscountAmount')} hint={t('form.maxDiscountAmountHint')}>
              <Input
                type="number"
                value={formData.maxDiscountAmount || ''}
                onChange={(e) => updateField('maxDiscountAmount', e.target.value ? Number(e.target.value) : undefined)}
                min={0}
                disabled={isSubmitting}
              />
            </FormDialogField>
          </div>
        ) : (
          <FormDialogField label={t('form.amountOff')} error={errors.amountOff}>
            <Input
              type="number"
              value={formData.amountOff || ''}
              onChange={(e) => updateField('amountOff', e.target.value ? Number(e.target.value) : 0)}
              min={0}
              disabled={isSubmitting}
            />
          </FormDialogField>
        )}

        <FormDialogField label={t('form.minSubtotal')} hint={t('form.minSubtotalHint')}>
          <Input
            type="number"
            value={formData.minSubtotal || ''}
            onChange={(e) => updateField('minSubtotal', e.target.value ? Number(e.target.value) : undefined)}
            min={0}
            disabled={isSubmitting}
          />
        </FormDialogField>
      </FormDialogSectionGroup>

      <FormDialogDivider />

      {/* Section 3: Giới hạn */}
      <FormDialogSectionGroup title={t('form.tabs.limits')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormDialogField label={t('form.startsAt')}>
            <Input
              type="date"
              value={formData.startsAt}
              onChange={(e) => updateField('startsAt', e.target.value)}
              disabled={isSubmitting}
            />
          </FormDialogField>

          <FormDialogField label={t('form.endsAt')}>
            <Input
              type="date"
              value={formData.endsAt}
              onChange={(e) => updateField('endsAt', e.target.value)}
              disabled={isSubmitting}
            />
          </FormDialogField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormDialogField label={t('form.maxRedemptionsTotal')} hint={t('form.maxRedemptionsTotalHint')}>
            <Input
              type="number"
              value={formData.maxRedemptionsTotal || ''}
              onChange={(e) => updateField('maxRedemptionsTotal', e.target.value ? Number(e.target.value) : undefined)}
              min={1}
              disabled={isSubmitting}
            />
          </FormDialogField>

          <FormDialogField label={t('form.maxRedemptionsPerCustomer')}>
            <Input
              type="number"
              value={formData.maxRedemptionsPerCustomer || ''}
              onChange={(e) => updateField('maxRedemptionsPerCustomer', e.target.value ? Number(e.target.value) : undefined)}
              min={1}
              disabled={isSubmitting}
            />
          </FormDialogField>
        </div>

        <FormDialogField label={t('form.minParty')} hint={t('form.minPartyHint')}>
          <Input
            type="number"
            value={formData.minParty || ''}
            onChange={(e) => updateField('minParty', e.target.value ? Number(e.target.value) : undefined)}
            min={1}
            disabled={isSubmitting}
          />
        </FormDialogField>

        <FormDialogField label={t('form.priority')} hint={t('form.priorityHint')}>
          <Input
            type="number"
            value={formData.priority}
            onChange={(e) => updateField('priority', Number(e.target.value) || 0)}
            min={0}
            disabled={isSubmitting}
          />
        </FormDialogField>
      </FormDialogSectionGroup>

      <FormDialogDivider />

      {/* Section 4: Hiển thị */}
      {formData.kind === 'automatic' && (
        <FormDialogSectionGroup title="Tùy chọn hiển thị">
          <FormDialogSection>
            <div className="space-y-0.5">
              <Label className="text-base">{t('form.autoApply')}</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('form.autoApplyHint')}</p>
            </div>
            <Switch
              checked={formData.autoApply}
              onCheckedChange={(checked) => updateField('autoApply', checked)}
              disabled={isSubmitting}
            />
          </FormDialogSection>

          <FormDialogSection>
            <div className="space-y-0.5">
              <Label className="text-base">{t('form.isPublic')}</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('form.isPublicHint')}</p>
            </div>
            <Switch
              checked={formData.isPublic}
              onCheckedChange={(checked) => updateField('isPublic', checked)}
              disabled={isSubmitting}
            />
          </FormDialogSection>
        </FormDialogSectionGroup>
      )}
    </FormDialog>
  );
}
