import { NextResponse } from 'next/server';

import { getSingleNavigationBySlug } from '@/db/navigation';

export async function GET(
  req: Request,
  { params }: { params: { slug: string; storeId: string } }
) {
  try {
    const { storeId, slug } = params || {};

    const navigation = await getSingleNavigationBySlug({ storeId, slug });

    return NextResponse.json(navigation);
  } catch (error) {
    console.error('[Navigation_slug_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
