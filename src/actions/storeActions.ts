'use server';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import isAuthorized from './_utils/isAuthorized';
import db from '@/db/db';
import { getSession } from '@/lib/auth';

const storeSchema = z.object({ name: z.string().min(1) });

export async function addStore(previousState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) redirect('/login');

  const data = Object.fromEntries(formData.entries());
  const result = storeSchema.safeParse(data);

  if (!result.success) {
    return result.error.formErrors.fieldErrors;
  }

  const { name } = result.data;

  let store;
  try {
    store = await db.store.create({
      data: { name, userId: session.user.id },
    });
  } catch (error: unknown) {
    console.error(error);

    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return { error: 'Store name already exists' };
    }
    return { error: 'Error while trying to add the store' };
  }

  revalidatePath('/', 'layout');
  redirect(`/dashboard/${store.id}`);
}

const updateStoreSchema = z.object({
  name: z.string().min(1),
  logo: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
});

export async function updateStore(
  storeId: string,
  logo: string | undefined,
  previousState: unknown,
  formData: FormData
) {
  if (!(await isAuthorized(storeId)) || !storeId) redirect('/login');

  const data = Object.fromEntries(formData.entries());
  const result = updateStoreSchema.safeParse(data);

  if (!result.success) return result.error.formErrors.fieldErrors;

  const {
    name,
    description,
    address,
    phone,
    email,
    facebook,
    instagram,
    twitter,
  } = result.data;

  try {
    await db.store.update({
      where: { id: storeId },
      data: {
        name,
        logo,
        description,
        address,
        phone,
        email,
        facebook,
        instagram,
        twitter,
      },
    });

    return {
      success: true,
      message: 'Store updated successfully',
    };
  } catch (error) {
    console.error(error);
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return { name: 'Store name already exists' };
    }
    return {
      error: true,
      message: 'Error while trying to update the store',
    };
  }
}

export async function deleteStore(storeId: string) {
  if (!(await isAuthorized(storeId))) redirect('/login');
  await db.store.delete({ where: { id: storeId } });
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
