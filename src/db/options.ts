import { Prisma } from '@prisma/client';

import db from '.';

const sortMap = new Map([
  ['newest', { createdAt: Prisma.SortOrder.desc }],
  ['oldest', { createdAt: Prisma.SortOrder.asc }],
  ['name-asc', { name: Prisma.SortOrder.asc }],
  ['name-desc', { name: Prisma.SortOrder.desc }],
]);

type GetOptionsParams = {
  storeId: string;
  page: number;
  pageSize: number;
  query?: string;
  sort?: string;
};

export const getOptions = async (params: GetOptionsParams) => {
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

  const include = {
    values: true,
  };

  const [options, count] = await Promise.all([
    db.option.findMany({
      where,
      include,
      skip: (Number(page) - 1) * pageSize,
      take: pageSize,
      orderBy: sortMap.get(sort),
    }),
    db.option.count({ where }),
  ]);

  return { options, count };
};

type GetOptionParams = {
  storeId: string;
  optionId: string;
};

export const getOption = async (params: GetOptionParams) => {
  const { storeId, optionId } = params;

  return db.option.findUnique({
    where: { id: optionId, storeId },
    include: { values: true },
  });
};
