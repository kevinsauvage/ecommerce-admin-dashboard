import { Prisma } from '@prisma/client';

import db from '.';

const sortMap = new Map([
  ['newest', { createdAt: Prisma.SortOrder.desc }],
  ['oldest', { createdAt: Prisma.SortOrder.asc }],
  ['name-asc', { name: Prisma.SortOrder.asc }],
  ['name-desc', { name: Prisma.SortOrder.desc }],
]);
const orderBy = { order: Prisma.SortOrder.asc };

const include = {
  items: {
    include: {
      items: {
        include: {
          items: {
            include: {
              items: {
                orderBy,
              },
            },
            orderBy,
          },
        },
        orderBy,
      },
    },
    orderBy,
  },
};

type GetNavigationParams = {
  storeId: string;
  page: number;
  pageSize: number;
  query?: string;
  sort?: string;
};

export const getNavigation = async (params: GetNavigationParams) => {
  const {
    storeId,
    page = 1,
    pageSize = 10,
    query = '',
    sort = 'newest',
  } = params || {};

  const where = {
    storeId,
    name: { contains: query, mode: Prisma.QueryMode.insensitive },
  };

  const [navigation, count] = await Promise.all([
    db.navigation.findMany({
      where,
      include,
      skip: (Number(page) - 1) * pageSize,
      take: pageSize,
      orderBy: sortMap.get(sort),
    }),
    db.option.count({ where }),
  ]);

  return { navigation, count };
};

export const GetSingleNavigationById = async ({
  storeId,
  navigationId,
}: {
  storeId: string;
  navigationId: string;
}) => {
  const orderBy = { order: Prisma.SortOrder.asc };

  return db.navigation.findUnique({
    where: { id: navigationId, storeId },
    include: {
      items: {
        where: { parentId: null },
        include,
        orderBy,
      },
    },
  });
};

export const getSingleNavigationBySlug = async ({
  storeId,
  slug,
}: {
  storeId: string;
  slug: string;
}) => {
  const orderBy = { order: Prisma.SortOrder.asc };

  return db.navigation.findFirst({
    where: { storeId, slug },
    include: {
      items: {
        where: { parentId: null },
        include,
        orderBy,
      },
    },
  });
};
