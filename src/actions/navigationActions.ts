'use server';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import isAuthorized from './_utils/isAuthorized';
import db from '@/db/db';
import { NavigationInputItem } from '@/types';

type ZodNavigationItem = {
  name: string;
  url: string;
  items: ZodNavigationItem[];
};

const navigationItemSchema: z.ZodSchema<ZodNavigationItem> = z.lazy(() =>
  z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    url: z.string().min(1, { message: 'URL is required' }),
    items: z.array(z.lazy(() => navigationItemSchema)),
  })
);

const navigationArraySchema = z.array(navigationItemSchema);

const NavigationSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  slug: z.string().min(1, { message: 'Slug is required' }),
  items: navigationArraySchema,
});

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
  storeId: string,
  navigationItem: NavigationInputItem[],
  previousState: unknown,
  formData: FormData
) {
  if (!(await isAuthorized(storeId))) redirect('/login');

  const data = Object.fromEntries(formData.entries());
  const result = NavigationSchema.safeParse({ ...data, items: navigationItem });

  if (!result.success) return result.error.formErrors.fieldErrors;

  const { name, slug } = result.data;

  try {
    const navigation = await db.navigation.create({
      data: { storeId, name, slug },
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
  storeId: string,
  navigationId: string,
  navigationItem: NavigationInputItem[],
  previousState: unknown,
  formData: FormData
) {
  if (!(await isAuthorized(storeId))) redirect('/login');
  if (!navigationId) redirect(`/dashboard/${storeId}/navigation`);

  const data = Object.fromEntries(formData.entries());
  const result = NavigationSchema.safeParse({ ...data, items: navigationItem });

  if (!result.success) return result.error.formErrors.fieldErrors;

  const { name, slug } = result.data;
  try {
    await db.navigation.update({
      where: { id: navigationId },
      data: { name, slug, items: { deleteMany: {} } },
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
  if (!(await isAuthorized(storeId)) || !navigationId) redirect('/login');
  await db.navigation.delete({ where: { id: navigationId, storeId } });
  revalidatePath('/', 'layout');
  redirect(`/dashboard/${storeId}/navigation`);
}
