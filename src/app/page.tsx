import { redirect } from 'next/navigation';

import { getSession } from '@/lib/auth';

export default async function SetupPage() {
  const session = await getSession();
  const userId = session?.user?.id;
  if (userId) redirect('/dashboard');
}
