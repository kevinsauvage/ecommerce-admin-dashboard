import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

import db from '@/db/db';

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

const getQueryParams = (searchParams: URLSearchParams) => {
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const query = searchParams.get('query') || '';
  const sort = searchParams.get('sort') || 'newest';
  const filter = searchParams.get('filter') || '';

  return { page, pageSize, query, sort, filter };
};

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params || {};
    const { searchParams } = new URL(req.url);
    const { page, pageSize, query, sort, filter } =
      getQueryParams(searchParams);

    const selectedFilters = filter?.split(',');

    const OR = [
      { isArchived: selectedFilters?.includes('archived') ? true : undefined },
      { isArchived: selectedFilters?.includes('active') ? false : undefined },
      { isFeatured: selectedFilters?.includes('featured') ? true : undefined },
    ].filter((condition) =>
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

    const [products, count] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
          variants: true,
          images: true,
          tags: true,
        },
        orderBy: sortMap.get(sort) ?? { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({ products, count });
  } catch (error) {
    console.error('[Products_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
