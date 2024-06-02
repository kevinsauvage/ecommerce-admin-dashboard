import { NextResponse } from 'next/server';

import { getOptions } from '@/db/options';

const getQueryParams = (searchParams: URLSearchParams) => {
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const query = searchParams.get('query') || '';
  const sort = searchParams.get('sort') || 'newest';

  return {
    page,
    pageSize,
    query,
    sort,
  };
};

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params || {};
    const { searchParams } = new URL(req.url);
    const { page, pageSize, query, sort } = getQueryParams(searchParams);

    const { options, count } = await getOptions({
      storeId,
      page,
      pageSize,
      query,
      sort,
    });

    return NextResponse.json({ options, count });
  } catch (error) {
    console.error('[Products_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
