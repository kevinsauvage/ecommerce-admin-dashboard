'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import isAuthorized from './_utils/isAuthorized';
import db from '@/db/db';

const categorySchema = z.object({
  name: z.string().min(1, { message: 'Please enter a name' }),
  description: z.string().optional(),
  imageURL: z.string().optional(),
  parentId: z.string().optional(),
});

export async function addCategory(
  storeId: string,
  imageURL: string | null | undefined,
  previousState: unknown,
  formData: FormData
) {
  try {
    if (!(await isAuthorized(storeId))) redirect('/login');

    const data = Object.fromEntries(formData.entries());
    const result = categorySchema.safeParse({ ...data, imageURL });

    if (!result.success) {
      return result.error.formErrors.fieldErrors;
    }

    await db.category.create({
      data: {
        storeId,
        ...result.data,
      },
    });
  } catch (error) {
    console.error(error);
    return { message: 'Error while trying to add the category' };
  }

  revalidatePath('/', 'layout');
  redirect(`/dashboard/${storeId}/categories`);
}

export async function updateCategory(
  storeId: string,
  categoryId: string,
  imageURL: string | null | undefined,
  previousState: unknown,
  formData: FormData
) {
  if (!(await isAuthorized(storeId))) redirect('/login');
  if (!categoryId) redirect(`/dashboard/${storeId}/categories`);

  const data = Object.fromEntries(formData.entries());
  const result = categorySchema.safeParse({ ...data, imageURL });

  if (!result.success) return result.error.formErrors.fieldErrors;

  try {
    await db.category.update({
      where: { id: categoryId },
      data: { ...result.data },
    });
  } catch (error) {
    console.error(error);
    return { message: 'Error while trying to update the category' };
  }

  revalidatePath('/', 'layout');
  redirect(`/dashboard/${storeId}/categories`);
}

export async function deleteCategory(categoryId: string, storeId: string) {
  if (!(await isAuthorized(storeId)) || !categoryId) redirect('/login');
  await db.category.delete({ where: { id: categoryId } });
  revalidatePath('/', 'layout');
  redirect(`/dashboard/${storeId}/categories`);
}
