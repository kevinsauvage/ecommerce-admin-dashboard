import { redirect } from 'next/navigation';

import StoreSettingsForm from './_components/SettingForm';
import Heading from '@/components/Heading';
import db from '@/db/db';

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
      <StoreSettingsForm store={store} />
    </>
  );
}
