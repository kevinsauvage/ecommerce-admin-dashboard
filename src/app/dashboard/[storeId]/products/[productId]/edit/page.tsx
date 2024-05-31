import { redirect } from 'next/navigation';

import ProductForm from '../../_components/ProductForm';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import Heading from '@/components/Heading';
import db from '@/db/db';

const getData = async (productId: string, storeId: string) => {
  return Promise.all([
    db.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        images: true,
        variants: {
          include: {
            options: {
              include: {
                optionValue: true,
                option: true,
              },
            },
          },
        },
        tags: true,
      },
    }),
    db.category.findMany({ where: { storeId } }),
    db.option.findMany({ where: { storeId }, include: { values: true } }),
  ]);
};

const getBreadcrumbItems = (storeId: string) => [
  { name: 'Dashboard', href: `/dashboard/${storeId}` },
  { name: 'Products', href: `/dashboard/${storeId}/products` },
  { name: 'Edit Product' },
];

export default async function ProductEditPage({
  params,
}: {
  params: { storeId: string; productId: string };
}) {
  const { storeId, productId } = params;
  const [product, categories, options] = await getData(productId, storeId);

  if (!product) redirect(`/dashboard/${storeId}/products`);

  return (
    <>
      <Heading title={`Edit Product`} />
      <BreadcrumbNav items={getBreadcrumbItems(storeId)} />
      <ProductForm
        product={JSON.parse(JSON.stringify(product))}
        categories={categories}
        options={options}
      />
    </>
  );
}
