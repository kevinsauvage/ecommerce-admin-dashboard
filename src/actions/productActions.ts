'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import isAuthorized from './_utils/isAuthorized';
import { VariantInput } from '@/app/dashboard/[storeId]/products/_components/ProductForm';
import db from '@/db/db';

const productSchema = z.object({
  name: z.string().min(1, { message: 'Please enter a name' }),
  slug: z.string().min(1, { message: 'Please enter a slug' }),
  description: z.string().min(1, { message: 'Please enter a description' }),
  price: z.coerce.number().min(1, { message: 'Please enter a price' }),
  salePrice: z.coerce.number().optional(),
  categoryId: z.string().min(1, { message: 'Please select a category' }),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
  stock: z.coerce.number().min(0).optional(),
  images: z.object({ url: z.string() }).array().nonempty({
    message: 'Please upload at least one image',
  }),
  tags: z.string().array().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  variants: z
    .object({
      stock: z.coerce.number().optional(),
      options: z
        .object({
          optionId: z.string().min(1, {
            message: 'Please select an option for all variants',
          }),
          valueId: z.string().min(1, {
            message: 'Please select a value for all variants',
          }),
        })
        .array()
        .min(1, {
          message:
            'Please select at least one option for all variants or delete the unfinished variant',
        }),
    })
    .array()
    .optional(),
});

export async function addProduct(
  storeId: string,
  productImages: Array<{ url: string }>,
  tags: Array<string>,
  variants: Array<VariantInput>,
  previousState: unknown,
  formData: FormData
) {
  if (!(await isAuthorized(storeId))) redirect('/login');

  const result = productSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    isFeatured: formData.get('isFeatured') === 'on',
    isArchived: formData.get('isArchived') === 'on',
    images: productImages,
    tags,
    variants,
  });

  if (!result.success) return result.error.formErrors.fieldErrors;

  const {
    stock,
    images,
    variants: variantsData = [],
    metaDescription,
    metaKeywords,
    metaTitle,
    categoryId,
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
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag, storeId },
            create: { name: tag, storeId },
          })),
        },
        variants: {
          createMany: {
            data: variantsData?.map((variant) => ({
              stock: variant.stock || 0,
              // Exclude the options field here
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
        categoryId,
      },
    });

    // Step 2: Create or connect VariantOptionValue records for each created variant
    const createdVariants = await db.variant.findMany({
      where: {
        productId: product.id,
      },
    });

    await Promise.all(
      createdVariants.map((createdVariant, index) =>
        Promise.all(
          variantsData[index].options.map((option) =>
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
    return { error: 'Error while trying to add the product' };
  }

  revalidatePath('/', 'layout');
  redirect(`/dashboard/${storeId}/products`);
}

export async function updateProduct(
  storeId: string,
  productId: string,
  productImages: Array<{ url: string }>,
  tags: Array<string>,
  variants: Array<VariantInput>,
  previousState: unknown,
  formData: FormData
) {
  if (!(await isAuthorized(storeId))) redirect('/login');
  if (!productId) redirect(`/dashboard/${storeId}/products`);

  const result = productSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    isFeatured: formData.get('isFeatured') === 'on',
    isArchived: formData.get('isArchived') === 'on',
    images: productImages,
    tags,
    variants,
  });

  if (!result.success) return result.error.formErrors.fieldErrors;

  const {
    stock,
    images,
    variants: variantsData = [],
    metaDescription,
    metaKeywords,
    metaTitle,
    categoryId,
    ...rest
  } = result.data;

  try {
    await db.product.update({
      where: { id: productId, storeId },
      data: {
        ...rest,
        stock: stock || 0,
        images: { deleteMany: {}, createMany: { data: images } },
        tags: {
          deleteMany: {},
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag, storeId },
            create: { name: tag, storeId },
          })),
        },
        variants: {
          deleteMany: {},
          createMany: {
            data: variantsData?.map((variant) => ({
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
        categoryId,
      },
    });

    // Step 2: Create or connect VariantOptionValue records for each created variant
    const createdVariants = await db.variant.findMany({
      where: {
        productId,
      },
    });

    await Promise.all(
      createdVariants.map((createdVariant, index) =>
        Promise.all(
          variantsData[index].options.map((option) =>
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
    return { error: 'Error while trying to update the product' };
  }
  revalidatePath('/', 'layout');
  redirect(`/dashboard/${storeId}/products`);
}

export async function deleteProduct(productId: string, storeId: string) {
  if (!(await isAuthorized(storeId)) || !productId) redirect('/login');
  await db.product.delete({ where: { id: productId } });
  revalidatePath('/', 'layout');
  redirect(`/dashboard/${storeId}/products`);
}
