import { z } from 'zod';

const categoriesSchema = z
  .string()
  .transform((value) => (value?.trim() ? value.split(',').map(String) : []))
  .pipe(
    z
      .string()
      .array()
      .min(1, { message: 'Please select at least one category' })
  );

const imagesSchema = z
  .string()
  .transform((value) =>
    value?.trim() ? value.split(',').map((url) => ({ url })) : []
  )
  .pipe(
    z
      .array(
        z.object({
          url: z.string().url({ message: 'Please enter a valid URL' }),
        })
      )
      .min(1, { message: 'Please upload at least one image' })
  );

const tagsSchema = z
  .string()
  .transform((value) => (value?.trim() ? value.split(',').map(String) : []))
  .pipe(z.string().array());

const variantSchema = z
  .string()
  .transform((value) => (value?.trim() ? JSON.parse(value) : []))
  .pipe(
    z
      .object({
        stock: z.coerce.number().min(0).optional(),
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
  );

export const productSchema = z.object({
  name: z.string().min(1, { message: 'Please enter a name' }),
  slug: z.string().min(1, { message: 'Please enter a slug' }),
  description: z.string().min(1, { message: 'Please enter a description' }),
  price: z.coerce.number().min(1, { message: 'Please enter a price' }),
  salePrice: z.coerce.number().optional(),
  stock: z.coerce.number().min(0).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
  categories: categoriesSchema,
  images: imagesSchema,
  tags: tagsSchema,
  variants: variantSchema,
});
