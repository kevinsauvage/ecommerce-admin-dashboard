import db from '@/db/db';
import { getSession } from '@/lib/auth';

export default async function isAuthorized(storeId: string) {
  const session = await getSession();

  if (!session || !storeId) {
    return false;
  }

  const storeByUserId = await db.store.findUnique({
    where: { id: storeId, userId: session.user.id },
  });

  if (storeByUserId) {
    return true;
  }

  return false;
}
