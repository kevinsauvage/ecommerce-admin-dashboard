import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import db from '@/db';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return new NextResponse(`Webhook Error: ${error.message}`, {
          status: 400,
        });
      }
      return new NextResponse('Webhook Error', { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const address = session?.customer_details?.address;

    const addressComponents = [
      address?.line1,
      address?.line2,
      address?.city,
      address?.state,
      address?.postal_code,
      address?.country,
    ];

    const addressString = addressComponents
      .filter((c) => c !== null)
      .join(', ');

    if (event.type === 'checkout.session.completed') {
      const order = await db.order.update({
        where: { id: session?.metadata?.orderId },
        data: {
          isPaid: true,
          address: addressString,
          phone: session?.customer_details?.phone || '',
        },
        include: { orderItems: { include: { product: true } } },
      });

      if (!order) {
        console.error(`Order with id ${session?.metadata?.orderId} not found`);
        return new NextResponse('Order not found', { status: 404 });
      }

      for (const orderItem of order.orderItems) {
        await db.product.update({
          where: { id: orderItem.productId },
          data: {
            stock: { decrement: orderItem.quantity },
            isArchived: orderItem.quantity >= orderItem.product.stock,
          },
        });
        if (orderItem.variantId) {
          await db.variant.update({
            where: { id: orderItem.variantId },
            data: { stock: { decrement: orderItem.quantity } },
          });
        }
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('[WEBHOOK_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
