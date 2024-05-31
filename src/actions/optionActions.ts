'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import isAuthorized from './_utils/isAuthorized';
import db from '@/db/db';
import capitalize from '@/utils/capitalize';

const optionSchema = z.object({
  name: z.string().min(1, { message: 'Please enter a name' }),
  values: z
    .array(z.string())
    .nonempty({ message: 'Please enter at least one value' }),
});

export async function addOption(
  storeId: string,
  values: string[],
  previousState: unknown,
  formData: FormData
) {
  if (!(await isAuthorized(storeId))) redirect('/login');

  const data = Object.fromEntries(formData.entries());
  const result = optionSchema.safeParse({ ...data, values });

  if (!result.success) return result.error.formErrors.fieldErrors;

  const { name } = result.data;

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

export async function updateOption(
  storeId: string,
  values: string[],
  optionId: string,
  previousState: unknown,
  formData: FormData
) {
  if (!(await isAuthorized(storeId))) redirect('/login');
  if (!optionId) redirect(`/dashboard/${storeId}/options`);

  const data = Object.fromEntries(formData.entries());
  const result = optionSchema.safeParse({ ...data, values });

  if (!result.success) return result.error.formErrors.fieldErrors;

  const { name } = result.data;
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
  if (!(await isAuthorized(storeId)) || !optionId) redirect('/login');
  await db.option.delete({ where: { id: optionId, storeId } });
  revalidatePath('/', 'layout');
  redirect(`/dashboard/${storeId}/options`);
}
