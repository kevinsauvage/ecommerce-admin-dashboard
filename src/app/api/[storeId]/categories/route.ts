import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

import db from '@/db/db';

const sortMap = new Map([
  ['newest', { createdAt: Prisma.SortOrder.desc }],
  ['oldest', { createdAt: Prisma.SortOrder.asc }],
  ['name-asc', { name: Prisma.SortOrder.asc }],
  ['name-desc', { name: Prisma.SortOrder.desc }],
]);

const getQueryParams = (searchParams: URLSearchParams) => {
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const query = searchParams.get('query') || '';
  const sort = searchParams.get('sort') || 'newest';
  const withChildCategories =
    searchParams.get('withChildCategories') === 'true';
  const onlyParentCategories =
    searchParams.get('onlyParentCategories') === 'true';

  return {
    page,
    pageSize,
    query,
    sort,
    withChildCategories,
    onlyParentCategories,
  };
};

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params || {};
    const { searchParams } = new URL(req.url);
    const {
      page,
      pageSize,
      query,
      sort,
      withChildCategories,
      onlyParentCategories,
    } = getQueryParams(searchParams);

    const [categories, count] = await Promise.all([
      db.category.findMany({
        where: {
          storeId,
          name: { contains: query, mode: Prisma.QueryMode.insensitive },
          parentId: onlyParentCategories ? { equals: null } : { not: null },
        },
        include: {
          childCategories: withChildCategories
            ? {
                include: {
                  childCategories: {
                    include: {
                      childCategories: true,
                    },
                  },
                },
              }
            : false,
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

    return NextResponse.json({ categories, count });
  } catch (error) {
    console.error('[Products_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
