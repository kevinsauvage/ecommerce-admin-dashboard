import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import db from '@/db';
import { stripe } from '@/lib/stripe';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

interface Body {
  cartProducts: Array<{
    id: string;
    quantity: number;
    variantId: string;
  }>;
  currency: string;
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  const { cartProducts, currency = 'USD' }: Body = await req.json();
  const { searchParams } = new URL(req.url);
  const redirectUrl = searchParams.get('redirectUrl');
  const storeId = params.storeId;

  if (!cartProducts.length) {
    return new NextResponse('Cart Products are required', { status: 400 });
  }

  const productsWithVariants = cartProducts.filter((item) => item.variantId);
  const productsWithoutVariants = cartProducts.filter(
    (item) => !item.variantId
  );

  const products = await db.product.findMany({
    where: {
      storeId,
      id: { in: productsWithoutVariants.map((item) => item.id) },
    },
    include: {
      images: true,
      variants: true,
    },
  });

  const variants = await db.variant.findMany({
    where: { id: { in: productsWithVariants.map((item) => item.variantId) } },
    include: {
      product: { include: { images: true } },
      options: {
        include: { option: true, optionValue: true },
      },
    },
  });

  const line_items: Array<Stripe.Checkout.SessionCreateParams.LineItem> = [];

  products.forEach((item) => {
    line_items.push({
      quantity: cartProducts.find((p) => p.id === item.id)?.quantity || 1,
      price_data: {
        currency,
        product_data: {
          name: item.name,
          images: item.images.map((image) => image.url),
        },
        unit_amount: Number(item.price) * 100,
      },
    });
  });

  variants.forEach((item) => {
    line_items.push({
      quantity:
        cartProducts.find((p) => p.variantId === item.id)?.quantity || 1,
      price_data: {
        currency,
        product_data: {
          name: item.product.name,
          description: `${item.product.name} - ${item.options.map((opt) => `${opt.option.name} - ${opt.optionValue.name}`).join(' / ')}`,
          images: item.product.images.map((image) => image.url),
        },
        unit_amount: Number(item.product.price) * 100,
      },
    });
  });

  const totalPrice =
    line_items.reduce(
      (total, item) =>
        total + (item.price_data?.unit_amount || 1) * (item?.quantity || 1),
      0
    ) / 100;

  const orderItems = [
    ...products.map((item) => ({
      product: { connect: { id: item.id } },
      quantity: cartProducts.find((p) => p.id === item.id)?.quantity || 1,
    })),
    ...variants.map((item) => ({
      product: { connect: { id: item.product.id } },
      quantity:
        cartProducts.find((p) => p.variantId === item.id)?.quantity || 1,
      variant: { connect: { id: item.id } },
    })),
  ];

  const order = await db.order.create({
    data: {
      storeId: params.storeId,
      isPaid: false,
      totalPrice,
      orderItems: { create: orderItems },
    },
  });

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: 'payment',
    billing_address_collection: 'required',
    phone_number_collection: { enabled: true },
    success_url: `${redirectUrl}/cart?success=1`,
    cancel_url: `${redirectUrl}/cart?canceled=1`,
    metadata: { orderId: order.id },
  });

  return NextResponse.json(
    { checkoutUrl: session.url },
    { headers: corsHeaders }
  );
}
