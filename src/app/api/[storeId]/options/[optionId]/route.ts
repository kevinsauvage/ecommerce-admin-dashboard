import { NextResponse } from 'next/server';

import { getOption } from '@/db/options';

export async function GET(
  req: Request,
  { params }: { params: { optionId: string; storeId: string } }
) {
  try {
    const { storeId, optionId } = params || {};

    const product = await getOption({ storeId, optionId });

    return NextResponse.json(product);
  } catch (error) {
    console.error('[Product_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
