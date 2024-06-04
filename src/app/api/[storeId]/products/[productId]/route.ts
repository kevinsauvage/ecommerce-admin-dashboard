import { NextResponse } from 'next/server';

import { getProduct } from '@/db/products';

export async function GET(
  req: Request,
  { params }: { params: { productId: string; storeId: string } }
) {
  try {
    const { storeId, productId } = params || {};
    const { searchParams } = new URL(req.url);

    const isFeatured = searchParams.get('isFeatured') === 'true';
    const isArchived = searchParams.get('isArchived') === 'true';
    const withVariants = searchParams.get('withVariants') === 'true';
    const withTags = searchParams.get('withTags') === 'true';
    const withCategory = searchParams.get('withCategory') === 'true';
    const withSeo = searchParams.get('withSeo') === 'true';

    const product = getProduct({
      storeId,
      productId,
      isFeatured,
      isArchived,
      withImages: true,
      withTags,
      withCategory,
      withSeo,
      withVariants,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('[Product_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
