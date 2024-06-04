import { Prisma } from '@prisma/client';

import db from './db';

const sortMap = new Map([
  ['newest', { createdAt: Prisma.SortOrder.desc }],
  ['oldest', { createdAt: Prisma.SortOrder.asc }],
  ['price-low-to-high', { price: Prisma.SortOrder.asc }],
  ['price-high-to-low', { price: Prisma.SortOrder.desc }],
  ['stock-low-to-high', { stock: Prisma.SortOrder.asc }],
  ['stock-high-to-low', { stock: Prisma.SortOrder.desc }],
  ['name-asc', { name: Prisma.SortOrder.asc }],
  ['name-desc', { name: Prisma.SortOrder.desc }],
]);

type GetProductsParams = {
  storeId: string;
  sort?: string;
  query?: string;
  page?: number;
  pageSize?: number;
  isArchived?: boolean;
  isFeatured?: boolean;
  withImages?: boolean;
  withVariants?: boolean;
  withTags?: boolean;
  withCategory?: boolean;
  withSeo?: boolean;
};

export const getProducts = async (params: GetProductsParams) => {
  const {
    storeId,
    page = 1,
    pageSize = 10,
    query = '',
    sort = 'newest',
    isArchived = undefined,
    isFeatured = undefined,
    withCategory = false,
    withImages = false,
    withVariants = false,
    withTags = false,
    withSeo = false,
  } = params || {};

  const OR = [{ isArchived }, { isFeatured }].filter((condition) =>
    Object.values(condition).some((value) => value !== undefined)
  );

  const AND = [
    { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
  ].filter((condition) =>
    Object.values(condition).some((value) => value !== undefined)
  );

  const where = {
    storeId,
    OR: OR.length ? OR : undefined,
    AND: AND.length ? AND : undefined,
  };

  const include = {
    category: withCategory,
    variants: withVariants
      ? {
          include: {
            options: {
              include: {
                optionValue: true,
                option: true,
              },
            },
          },
        }
      : undefined,
    images: withImages,
    tags: withTags,
    seo: withSeo,
  };

  const [products, count] = await Promise.all([
    db.product.findMany({
      where,
      include,
      orderBy: sortMap.get(sort) ?? { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where }),
  ]);

  return { products, count };
};

type GetProductParams = {
  storeId: string;
  productId: string;
  isFeatured?: boolean;
  isArchived?: boolean;
  withImages?: boolean;
  withVariants?: boolean;
  withTags?: boolean;
  withCategory?: boolean;
  withSeo?: boolean;
};

export const getProduct = async (params: GetProductParams) => {
  const {
    storeId,
    productId,
    isFeatured,
    isArchived,
    withCategory = false,
    withImages = false,
    withVariants = false,
    withTags = false,
    withSeo = false,
  } = params || {};

  const where = {
    storeId,
    id: productId,
    isFeatured,
    isArchived,
  };

  const include = {
    category: withCategory,
    variants: withVariants
      ? {
          include: {
            options: {
              include: {
                optionValue: true,
                option: true,
              },
            },
          },
        }
      : undefined,
    images: withImages,
    tags: withTags,
    seo: withSeo,
  };

  return db.product.findUnique({ where, include });
};
