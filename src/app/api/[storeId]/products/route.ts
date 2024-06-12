import { NextResponse } from 'next/server';

import { getProducts } from '@/db/products';

const getQueryParams = (searchParams: URLSearchParams) => {
  const page = Number(searchParams.get('page') || 1);
  const pageSize = Number(searchParams.get('pageSize') || 10);
  const query = searchParams.get('query') || '';
  const sort = searchParams.get('sort') || 'newest';
  const filter = searchParams.get('filter') || '';
  const categoryIds = searchParams.get('categoryIds') || undefined;

  const withTags = searchParams.get('withTags') === 'true';
  const withCategories = searchParams.get('withCategories') === 'true';
  const withSeo = searchParams.get('withSeo') === 'true';

  const isArchived = searchParams.has('isArchived')
    ? searchParams.get('isArchived') === 'true'
    : undefined;
  const isFeatured = searchParams.has('isFeatured')
    ? searchParams.get('isFeatured') === 'true'
    : undefined;

  return {
    page,
    pageSize,
    query,
    sort,
    filter,
    withTags,
    withCategories,
    withSeo,
    categoryIds,
    isArchived,
    isFeatured,
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
      isArchived,
      isFeatured,
      withTags,
      withCategories,
      withSeo,
      categoryIds,
    } = getQueryParams(searchParams);

    const { products, count } = await getProducts({
      storeId,
      page,
      pageSize,
      query,
      sort,
      isArchived,
      isFeatured,
      withTags,
      withCategories,
      withSeo,
      categoryIds: categoryIds ? categoryIds.split(',') : undefined,
    });

    return NextResponse.json({ products, count });
  } catch (error) {
    console.error('[Products_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
