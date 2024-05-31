import { NextResponse } from 'next/server';

import db from '@/db/db';

export async function GET(
  req: Request,
  { params }: { params: { productId: string; storeId: string } }
) {
  try {
    const { storeId, productId } = params || {};
    const { searchParams } = new URL(req.url);

    const isFeatured = searchParams.get('isFeatured') === 'true';
    const withVariants = searchParams.get('withVariants') === 'true';

    const product = await db.product.findUnique({
      where: {
        id: productId,
        storeId,
        isFeatured: isFeatured || undefined,
      },
      include: {
        images: true,
        category: true,
        variants: withVariants,
        tags: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('[Product_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
