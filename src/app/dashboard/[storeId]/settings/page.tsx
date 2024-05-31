import { redirect } from 'next/navigation';

import StoreSettingsForm from './_components/SettingForm';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import Heading from '@/components/Heading';
import db from '@/db/db';

const getBreadcrumbItems = (storeId: string) => [
  { name: 'Dashboard', href: `/dashboard/${storeId}` },
  { name: 'Store settings' },
];

export default async function settings({
  params,
}: {
  params: { storeId: string };
}) {
  const { storeId } = params;
  const store = await db.store.findUnique({ where: { id: storeId } });
  if (!store) return redirect('/setup');

  return (
    <>
      <Heading title="Settings" />
      <BreadcrumbNav items={getBreadcrumbItems(storeId)} />
      <StoreSettingsForm store={store} />
    </>
  );
}
