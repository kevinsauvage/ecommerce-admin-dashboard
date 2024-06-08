'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import isAuthorized from './_utils/isAuthorized';
import db from '@/db/db';
import { CategorySchema } from '@/zod/schemas/Category';

export async function addCategory(previousState: unknown, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const storeId = data.storeId as string;
  await isAuthorized(storeId);

  try {
    const result = CategorySchema.safeParse(data);

    if (!result.success) return result.error.formErrors.fieldErrors;

    await db.category.create({ data: { ...result.data, storeId } });
  } catch (error) {
    console.error('Error while trying to add the category:', error);
    return { message: 'Error while trying to add the category' };
  }

  revalidatePath('/', 'layout');
  redirect(`/dashboard/${storeId}/categories`);
}

export async function updateCategory(
  previousState: unknown,
  formData: FormData
) {
  const data = Object.fromEntries(formData.entries());
  const storeId = data.storeId as string;
  const categoryId = data.categoryId as string;

  await isAuthorized(storeId);

  try {
    if (!categoryId) redirect(`/dashboard/${storeId}/categories`);

    const result = CategorySchema.safeParse(data);

    if (!result.success) return result.error.formErrors.fieldErrors;

    const where = { id: categoryId, storeId };
    await db.category.update({ where, data: result.data });
  } catch (error) {
    console.error('Error while trying to update the category:', error);
    return { message: 'Error while trying to update the category' };
  }

  revalidatePath('/', 'layout');
  redirect(`/dashboard/${storeId}/categories`);
}

export async function deleteCategory(categoryId: string, storeId: string) {
  try {
    await isAuthorized(storeId);

    if (!categoryId) redirect(`/dashboard/${storeId}/categories`);

    await db.category.delete({ where: { id: categoryId } });
  } catch (error) {
    console.error('Error while trying to delete the category:', error);
    return { message: 'Error while trying to delete the category' };
  }

  revalidatePath('/', 'layout');
  redirect(`/dashboard/${storeId}/categories`);
}
