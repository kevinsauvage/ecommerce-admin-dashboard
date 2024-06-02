import { redirect } from 'next/navigation';

import db from '@/db/db';
import { getSession } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) return redirect('/login');

  const store = await db.store.findFirst({ where: { userId } });

  return store ? redirect(`/dashboard/${store.id}`) : redirect('/setup');
}
