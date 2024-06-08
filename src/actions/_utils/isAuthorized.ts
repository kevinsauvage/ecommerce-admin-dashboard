import { redirect } from 'next/navigation';

import { getSession } from '@/lib/auth';

export default async function isAuthorized(storeId: string) {
  const session = await getSession();

  if (!session || !storeId) {
    return redirect('/login');
  }
}
