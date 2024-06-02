import { NextResponse } from 'next/server';

import { getProducts } from '@/db/products';

const getQueryParams = (searchParams: URLSearchParams) => {
  const page = Number(searchParams.get('page'));
  const pageSize = Number(searchParams.get('pageSize'));
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

    const { products, count } = await getProducts({
      storeId,
      page,
      pageSize,
      query,
      sort,
      isArchived: selectedFilters?.includes('archived'),
      isFeatured: selectedFilters?.includes('featured'),
    });

    return NextResponse.json({ products, count });
  } catch (error) {
    console.error('[Products_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
