import { NextResponse } from 'next/server';

import db from '@/db/db';

export async function GET(
  req: Request,
  { params }: { params: { categoryId: string; storeId: string } }
) {
  try {
    const { storeId, categoryId } = params || {};

    const category = await db.category.findUnique({
      where: { id: categoryId, storeId },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('[Category_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
