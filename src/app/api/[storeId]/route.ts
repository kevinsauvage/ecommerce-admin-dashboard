import { NextResponse } from 'next/server';

import db from '@/db';

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params || {};
    const store = await db.store.findFirst({ where: { id: storeId } });
    return NextResponse.json(store);
  } catch (error) {
    console.error('[Store_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
