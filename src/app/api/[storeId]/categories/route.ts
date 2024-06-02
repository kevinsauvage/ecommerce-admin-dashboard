import { NextResponse } from 'next/server';

import { getCategories } from '@/db/categories';

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
    const { page, pageSize, query, sort, onlyParentCategories } =
      getQueryParams(searchParams);

    const { categories, count } = await getCategories({
      storeId,
      page,
      pageSize,
      query,
      sort,
      onlyParentCategories,
    });

    return NextResponse.json({ categories, count });
  } catch (error) {
    console.error('[Products_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
