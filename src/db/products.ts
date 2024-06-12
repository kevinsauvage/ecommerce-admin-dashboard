import { Prisma } from '@prisma/client';

import db from '.';

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
  categoryIds?: string[];
  page?: number;
  pageSize?: number;
  isArchived?: boolean | undefined;
  isFeatured?: boolean | undefined;
  withTags?: boolean;
  withCategories?: boolean;
  withSeo?: boolean;
};

export const getProducts = async (params: GetProductsParams) => {
  const {
    storeId,
    page = 1,
    pageSize = 10,
    query = '',
    sort = 'newest',
    isArchived,
    isFeatured,
    withCategories = false,
    withTags = false,
    withSeo = false,
    categoryIds = undefined,
  } = params || {};

  const AND: Prisma.ProductWhereInput[] = [];
  const OR: Prisma.ProductWhereInput[] = [];

  if (query) {
    AND.push({ name: { contains: query, mode: Prisma.QueryMode.insensitive } });
  }

  if (categoryIds?.length) {
    categoryIds.forEach((categoryId) => {
      OR.push({ categories: { some: { id: categoryId } } });
    });
  }

  if (isArchived !== undefined) {
    AND.push({ isArchived });
  }

  if (isFeatured !== undefined) {
    AND.push({ isFeatured });
  }

  const where = {
    storeId,
    AND: AND.length ? AND : undefined,
    OR: OR.length ? OR : undefined,
  };

  const include = {
    categories: withCategories,
    variants: {
      include: {
        options: {
          include: {
            optionValue: true,
            option: true,
          },
        },
      },
    },
    tags: withTags,
    seo: withSeo,
    images: true,
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
  withTags?: boolean;
  withCategories?: boolean;
  withSeo?: boolean;
};

export const getProduct = async (params: GetProductParams) => {
  const {
    storeId,
    productId,
    isFeatured,
    isArchived,
    withCategories = false,
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
    categories: withCategories,
    variants: {
      include: {
        options: {
          include: {
            optionValue: true,
            option: true,
          },
        },
      },
    },
    images: true,
    tags: withTags,
    seo: withSeo,
  };

  return db.product.findUnique({ where, include });
};
