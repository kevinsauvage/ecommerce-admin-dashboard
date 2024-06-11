'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import isAuthorized from './_utils/isAuthorized';
import db from '@/db';
import capitalize from '@/utils/capitalize';
import { optionSchema } from '@/zod/schemas/Option';

export async function addOption(previousState: unknown, formData: FormData) {
  const data = Object.fromEntries(formData.entries());

  const storeId = data.storeId as string;
  await isAuthorized(storeId);

  const result = optionSchema.safeParse(data);
  if (!result.success) return result.error.formErrors.fieldErrors;

  const { name, values } = result.data;

  try {
    await db.option.create({
      data: {
        storeId,
        name: capitalize(name),
        values: {
          create: values.map((value) => ({
            name: capitalize(value),
          })),
        },
      },
    });
  } catch (error) {
    console.error(error);
    return { error: 'Error while trying to add the option' };
  }

  revalidatePath('/', 'layout');
  redirect(`/dashboard/${storeId}/options`);
}

export async function updateOption(previousState: unknown, formData: FormData) {
  const data = Object.fromEntries(formData.entries());

  const storeId = data.storeId as string;
  await isAuthorized(storeId);

  const optionId = data.optionId as string;
  if (!optionId) redirect(`/dashboard/${storeId}/options`);

  const result = optionSchema.safeParse(data);
  if (!result.success) return result.error.formErrors.fieldErrors;

  const { name, values } = result.data;
  try {
    await db.option.update({
      where: { id: optionId },
      data: {
        name: capitalize(name),
        values: {
          deleteMany: {},
          create: values.map((value) => ({
            name: capitalize(value),
          })),
        },
      },
    });
  } catch (error) {
    console.error(error);
    return { error: 'Error while trying to update the option' };
  }

  revalidatePath('/', 'layout');
  redirect(`/dashboard/${storeId}/options`);
}

export async function deleteOption(optionId: string, storeId: string) {
  await isAuthorized(storeId);

  if (!optionId) redirect('/login');

  try {
    await db.option.delete({ where: { id: optionId, storeId } });
  } catch (error) {
    console.error(error);
    return { error: true, message: 'Error while trying to delete the option' };
  }

  revalidatePath('/', 'layout');
  redirect(`/dashboard/${storeId}/options`);
}
