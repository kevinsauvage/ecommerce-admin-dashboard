import { NextResponse } from 'next/server';

import { getCategory } from '@/db/categories';

export async function GET(
  req: Request,
  { params }: { params: { categoryId: string; storeId: string } }
) {
  try {
    const { storeId, categoryId } = params || {};

    const category = await getCategory({
      storeId,
      categoryId,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('[Category_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
