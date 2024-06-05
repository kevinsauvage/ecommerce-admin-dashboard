import { Prisma } from '@prisma/client';

import db from './db';

const sortMap = new Map([
  ['newest', { createdAt: Prisma.SortOrder.desc }],
  ['oldest', { createdAt: Prisma.SortOrder.asc }],
  ['name-asc', { name: Prisma.SortOrder.asc }],
  ['name-desc', { name: Prisma.SortOrder.desc }],
]);

type GetCategoriesParams = {
  storeId: string;
  page: number;
  pageSize: number;
  query?: string;
  sort?: string;
  whereExtra?: Prisma.CategoryWhereInput;
};

export const getCategories = async (params: GetCategoriesParams) => {
  const {
    storeId,
    page = 1,
    pageSize = 10,
    query = '',
    sort = 'newest',
    whereExtra,
  } = params || {};

  const where = {
    storeId,
    name: { contains: query, mode: Prisma.QueryMode.insensitive },
    ...whereExtra,
  };

  const include = {};

  const [categories, count] = await Promise.all([
    db.category.findMany({
      where,
      include,
      skip: (Number(page) - 1) * pageSize,
      take: pageSize,
      orderBy: sortMap.get(sort),
    }),
    db.category.count({ where }),
  ]);

  return { categories, count };
};

type GetCategoryParams = {
  storeId: string;
  categoryId: string;
};

export const getCategory = async (params: GetCategoryParams) => {
  const { storeId, categoryId } = params;

  const where = { id: categoryId, storeId };

  const include = {};

  return await db.category.findUnique({ where, include });
};
