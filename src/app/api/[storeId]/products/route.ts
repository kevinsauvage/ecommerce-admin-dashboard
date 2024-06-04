import { NextResponse } from 'next/server';

import { getProducts } from '@/db/products';

const getQueryParams = (searchParams: URLSearchParams) => {
  const page = Number(searchParams.get('page'));
  const pageSize = Number(searchParams.get('pageSize'));

  const query = searchParams.get('query') || '';
  const sort = searchParams.get('sort') || 'newest';
  const filter = searchParams.get('filter') || '';

  const withVariants = searchParams.get('withVariants') === 'true';
  const withTags = searchParams.get('withTags') === 'true';
  const withCategory = searchParams.get('withCategory') === 'true';
  const withSeo = searchParams.get('withSeo') === 'true';
  const withImages = searchParams.get('withImages') === 'true';

  return {
    page,
    pageSize,
    query,
    sort,
    filter,
    withVariants,
    withTags,
    withCategory,
    withSeo,
    withImages,
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
      filter,
      withTags,
      withCategory,
      withVariants,
      withSeo,
      withImages,
    } = getQueryParams(searchParams);

    const selectedFilters = filter?.split(',');

    const { products, count } = await getProducts({
      storeId,
      page,
      pageSize,
      query,
      sort,
      isArchived: selectedFilters?.includes('archived'),
      isFeatured: selectedFilters?.includes('featured'),
      withImages,
      withVariants,
      withTags,
      withCategory,
      withSeo,
    });

    return NextResponse.json({ products, count });
  } catch (error) {
    console.error('[Products_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
