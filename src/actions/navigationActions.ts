'use server';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import isAuthorized from './_utils/isAuthorized';
import db from '@/db';
import { NavigationInputItem } from '@/types';
import {
  NavigationArraySchema,
  NavigationSchema,
} from '@/zod/schemas/Navigation';

async function createNavigationItems(
  navigationId: string,
  items: NavigationInputItem[],
  parentId: string | undefined = undefined
) {
  for (const [index, item] of items.entries()) {
    const newItem = await db.navigationItem.create({
      data: {
        navigationId,
        parentId,
        name: item.name,
        url: item.url,
        order: index,
        categoryId: item.category?.id,
      },
    });

    if (item.items && item.items.length > 0) {
      await createNavigationItems(navigationId, item.items, newItem.id);
    }
  }
}

export async function addNavigation(
  navigationItem: NavigationInputItem[],
  previousState: unknown,
  formData: FormData
) {
  const data = Object.fromEntries(formData.entries());

  const storeId = data.storeId as string;
  await isAuthorized(storeId);

  const result = NavigationSchema.safeParse(data);
  if (!result.success) return result.error.formErrors.fieldErrors;

  const itemsResult = NavigationArraySchema.safeParse(navigationItem);
  if (!itemsResult.success) return itemsResult.error.formErrors.fieldErrors;

  try {
    const navigation = await db.navigation.create({
      data: { storeId, ...result.data },
    });

    await createNavigationItems(navigation.id, navigationItem);
  } catch (error) {
    console.error(error);

    return error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
      ? { slug: 'Slug already exists' }
      : { error: 'Something went wrong, please try again' };
  }

  revalidatePath('/', 'layout');
  redirect(`/dashboard/${storeId}/navigation`);
}

export async function updateNavigation(
  navigationItem: NavigationInputItem[],
  previousState: unknown,
  formData: FormData
) {
  const data = Object.fromEntries(formData.entries());

  const storeId = data.storeId as string;
  await isAuthorized(storeId);

  const result = NavigationSchema.safeParse(data);
  if (!result.success) return result.error.formErrors.fieldErrors;

  const itemsResult = NavigationArraySchema.safeParse(navigationItem);
  if (!itemsResult.success) return itemsResult.error.formErrors.fieldErrors;

  try {
    const navigationId = data.navigationId as string;
    await db.navigation.update({
      where: { id: navigationId },
      data: { ...result.data, items: { deleteMany: {} } },
    });

    await createNavigationItems(navigationId, navigationItem);
  } catch (error) {
    console.error(error);

    return error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
      ? { slug: 'Slug already exists' }
      : { error: 'Something went wrong, please try again' };
  }

  revalidatePath('/', 'layout');
  redirect(`/dashboard/${storeId}/navigation`);
}

export async function deleteNavigation(navigationId: string, storeId: string) {
  await isAuthorized(storeId);

  try {
    await db.navigation.delete({ where: { id: navigationId, storeId } });
  } catch (error) {
    console.error(error);
    return { error: true, message: 'Something went wrong, please try again' };
  }

  revalidatePath('/', 'layout');
  redirect(`/dashboard/${storeId}/navigation`);
}
