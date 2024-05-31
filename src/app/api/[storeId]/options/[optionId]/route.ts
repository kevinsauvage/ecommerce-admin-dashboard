import { NextResponse } from 'next/server';

import db from '@/db/db';

export async function GET(
  req: Request,
  { params }: { params: { optionId: string; storeId: string } }
) {
  try {
    const { storeId, optionId } = params || {};

    const product = await db.product.findUnique({
      where: {
        id: optionId,
        storeId,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('[Product_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
