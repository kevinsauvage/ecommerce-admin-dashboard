import { NextResponse } from 'next/server';

import { getProduct } from '@/db/products';

export async function GET(
  req: Request,
  { params }: { params: { productId: string; storeId: string } }
) {
  try {
    const { storeId, productId } = params || {};
    const { searchParams } = new URL(req.url);

    const isArchived = searchParams.has('isArchived')
      ? searchParams.get('isArchived') === 'true'
      : undefined;
    const isFeatured = searchParams.has('isFeatured')
      ? searchParams.get('isFeatured') === 'true'
      : undefined;

    const withTags = searchParams.get('withTags') === 'true';
    const withCategories = searchParams.get('withCategories') === 'true';
    const withSeo = searchParams.get('withSeo') === 'true';

    const product = await getProduct({
      storeId,
      productId,
      isFeatured,
      isArchived,
      withTags,
      withCategories,
      withSeo,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('[Product_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
