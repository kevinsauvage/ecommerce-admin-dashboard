'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import isAuthorized from './_utils/isAuthorized';
import db from '@/db';
import { productSchema } from '@/zod/schemas/Product';

export async function addProduct(previousState: unknown, formData: FormData) {
  const data = Object.fromEntries(formData.entries());

  const storeId = data.storeId as string;
  await isAuthorized(storeId);

  const result = productSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    isFeatured: formData.get('isFeatured') === 'on',
    isArchived: formData.get('isArchived') === 'on',
  });

  if (!result.success) return result.error.formErrors.fieldErrors;
  const {
    stock,
    images,
    variants = [],
    metaDescription,
    metaKeywords,
    metaTitle,
    categories,
    tags,
    ...rest
  } = result.data;

  try {
    const product = await db.product.create({
      data: {
        ...rest,
        storeId,
        stock: stock || 0,
        images: { createMany: { data: images } },
        tags: {
          connectOrCreate: tags?.map((tag) => ({
            where: { name: tag, storeId },
            create: { name: tag, storeId },
          })),
        },
        variants: {
          createMany: {
            data: variants?.map((variant) => ({
              stock: variant.stock || 0,
            })),
          },
        },
        seo: {
          create: {
            metaTitle,
            metaDescription,
            metaKeywords,
          },
        },
        categories: {
          connect: categories.map((categoryId) => ({ id: categoryId })),
        },
      },
    });

    const createdVariants = await db.variant.findMany({
      where: { productId: product.id },
    });

    await Promise.all(
      createdVariants.map((createdVariant, index) =>
        Promise.all(
          variants[index].options.map((option) =>
            db.variantOptionValue.upsert({
              where: {
                variantId_optionValueId: {
                  variantId: createdVariant.id,
                  optionValueId: option.valueId,
                },
              },
              update: {},
              create: {
                variantId: createdVariant.id,
                optionValueId: option.valueId,
                optionId: option.optionId,
              },
            })
          )
        )
      )
    );
  } catch (error) {
    console.error(error);
    return { message: 'Error while trying to add the product' };
  }

  revalidatePath('/', 'layout');
  redirect(`/dashboard/${storeId}/products`);
}

export async function updateProduct(
  previousState: unknown,
  formData: FormData
) {
  const data = Object.fromEntries(formData.entries());

  const storeId = data.storeId as string;
  await isAuthorized(storeId);

  const result = productSchema.safeParse({
    ...data,
    isFeatured: formData.get('isFeatured') === 'on',
    isArchived: formData.get('isArchived') === 'on',
  });

  if (!result.success) return result.error.formErrors.fieldErrors;

  const {
    stock,
    images,
    variants,
    metaDescription,
    metaKeywords,
    metaTitle,
    categories,
    tags,
    ...rest
  } = result.data;

  try {
    const productId = data.productId as string;

    await db.product.update({
      where: { id: productId, storeId },
      data: {
        ...rest,
        stock: stock || 0,
        images: { deleteMany: {}, createMany: { data: images } },
        tags: {
          deleteMany: {},
          connectOrCreate: tags?.map((tag) => ({
            where: { name: tag, storeId },
            create: { name: tag, storeId },
          })),
        },
        variants: {
          deleteMany: {},
          createMany: {
            data: variants?.map((variant) => ({
              stock: variant.stock || 0,
            })),
          },
        },
        seo: {
          upsert: {
            create: {
              metaTitle,
              metaDescription,
              metaKeywords,
            },
            update: {
              metaTitle,
              metaDescription,
              metaKeywords,
            },
          },
        },
        categories: {
          set: categories.map((categoryId) => ({ id: categoryId })),
        },
      },
    });

    const createdVariants = await db.variant.findMany({
      where: { productId },
    });

    await Promise.all(
      createdVariants.map((createdVariant, index) =>
        Promise.all(
          variants[index].options.map((option) =>
            db.variantOptionValue.upsert({
              where: {
                variantId_optionValueId: {
                  variantId: createdVariant.id,
                  optionValueId: option.valueId,
                },
              },
              update: {},
              create: {
                variantId: createdVariant.id,
                optionValueId: option.valueId,
                optionId: option.optionId,
              },
            })
          )
        )
      )
    );
  } catch (error) {
    console.error(error);
    return { message: 'Error while trying to update the product' };
  }

  revalidatePath('/', 'layout');
  redirect(`/dashboard/${storeId}/products`);
}

export async function deleteProduct(productId: string, storeId: string) {
  await isAuthorized(storeId);

  try {
    await db.product.delete({ where: { id: productId, storeId } });
  } catch (error) {
    console.error(error);
    return { error: true, message: 'Error while trying to delete the product' };
  }

  revalidatePath('/', 'layout');
  redirect(`/dashboard/${storeId}/products`);
}
