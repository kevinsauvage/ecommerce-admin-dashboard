import { redirect } from 'next/navigation';

import OptionForm from '../../_components/OptionForm';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import Heading from '@/components/Heading';
import db from '@/db/db';

const getBreadcrumbItems = (storeId: string) => [
  { name: 'Dashboard', href: `/dashboard/${storeId}` },
  { name: 'Options', href: `/dashboard/${storeId}/options` },
  { name: 'Edit Option' },
];

export default async function OptionEditPage({
  params,
}: {
  params: { storeId: string; optionId: string };
}) {
  const { storeId, optionId } = params;

  const option = await db.option.findUnique({
    where: { id: optionId },
    include: { values: true },
  });

  if (!option) {
    redirect(`/dashboard/${storeId}/options`);
  }

  return (
    <>
      <Heading title="Edit Option" />
      <BreadcrumbNav items={getBreadcrumbItems(storeId)} />
      <OptionForm option={option} />
    </>
  );
}
