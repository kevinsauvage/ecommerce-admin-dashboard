import { redirect } from 'next/navigation';

import ProductForm from '../../_components/ProductForm';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import Heading from '@/components/Heading';
import { getCategories } from '@/db/categories';
import { getOptions } from '@/db/options';
import { getProduct } from '@/db/products';

const getData = async (productId: string, storeId: string) => {
  return Promise.all([
    getProduct({
      storeId,
      productId,
      withTags: true,
      withCategories: true,
      withSeo: true,
    }),
    getCategories({
      storeId,
      page: 1,
      pageSize: 100,
    }),
    getOptions({ storeId, page: 1, pageSize: 100 }),
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
        categories={categories.categories}
        options={options.options}
      />
    </>
  );
}
