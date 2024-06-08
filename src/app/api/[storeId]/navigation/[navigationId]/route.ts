import { NextResponse } from 'next/server';

import { GetSingleNavigationById } from '@/db/navigation';

export async function GET(
  req: Request,
  { params }: { params: { navigationId: string; storeId: string } }
) {
  try {
    const { storeId, navigationId } = params || {};

    const navigation = await GetSingleNavigationById({ storeId, navigationId });

    return NextResponse.json(navigation);
  } catch (error) {
    console.error('[Navigation_id_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
