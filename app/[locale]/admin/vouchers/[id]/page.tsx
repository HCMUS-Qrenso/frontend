import { VoucherDetailPage } from '@/src/features/admin/vouchers/components';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminVoucherDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <VoucherDetailPage id={id} />;
}
