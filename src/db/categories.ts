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
  onlyParentCategories?: boolean;
};

export const getCategories = async (params: GetCategoriesParams) => {
  const {
    storeId,
    page = 1,
    pageSize = 10,
    query = '',
    sort = 'newest',
    onlyParentCategories,
  } = params || {};

  const [categories, count] = await Promise.all([
    db.category.findMany({
      where: {
        storeId,
        name: { contains: query, mode: Prisma.QueryMode.insensitive },
        parentId: onlyParentCategories ? { equals: null } : { not: null },
      },
      include: {
        childCategories: {
          include: {
            childCategories: {
              include: {
                childCategories: true,
              },
            },
          },
        },
      },
      skip: (Number(page) - 1) * pageSize,
      take: pageSize,
      orderBy: sortMap.get(sort),
    }),
    db.category.count({
      where: {
        storeId,
        name: { contains: query },
      },
    }),
  ]);

  return { categories, count };
};
