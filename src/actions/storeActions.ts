'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import isAuthorized from './_utils/isAuthorized';
import db from '@/db';
import { getSession } from '@/lib/auth';
import { storeSchema } from '@/zod/schemas/Store';

export async function addStore(previousState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) redirect('/login');

  const data = Object.fromEntries(formData.entries());
  const result = storeSchema.safeParse(data);

  if (!result.success) return result.error.formErrors.fieldErrors;

  let store;

  try {
    store = await db.store.create({
      data: { ...result.data, userId: session.user.id },
    });
  } catch (error: unknown) {
    console.error(error);
    return { error: 'Error while trying to add the store' };
  }

  revalidatePath('/', 'layout');
  redirect(`/dashboard/${store.id}`);
}

export async function updateStore(previousState: unknown, formData: FormData) {
  const data = Object.fromEntries(formData.entries());

  const storeId = data.storeId as string;
  await isAuthorized(storeId);

  const result = storeSchema.safeParse(data);

  if (!result.success) return result.error.formErrors.fieldErrors;

  try {
    await db.store.update({ where: { id: storeId }, data: result.data });

    return { success: true, message: 'Store updated successfully' };
  } catch (error) {
    console.error(error);
    return { error: true, message: 'Error while trying to update the store' };
  }
}

export async function deleteStore(storeId: string) {
  await isAuthorized(storeId);

  try {
    await db.store.delete({ where: { id: storeId } });
  } catch (error) {
    console.error(error);
    return { message: 'Error while trying to delete the store' };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
