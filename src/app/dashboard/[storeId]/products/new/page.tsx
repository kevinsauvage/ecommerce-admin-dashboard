import ProductForm from '../_components/ProductForm';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import Heading from '@/components/Heading';
import db from '@/db/db';

const getData = async (productId: string, storeId: string) => {
  return Promise.all([
    db.category.findMany({ where: { storeId } }),
    db.option.findMany({ where: { storeId }, include: { values: true } }),
  ]);
};

const getBreadcrumbItems = (storeId: string) => [
  { name: 'Dashboard', href: `/dashboard/${storeId}` },
  { name: 'Products', href: `/dashboard/${storeId}/products` },
  { name: 'Add Product' },
];

export default async function ProductEditPage({
  params,
}: {
  params: { storeId: string; productId: string };
}) {
  const { storeId, productId } = params;
  const [categories, options] = await getData(productId, storeId);

  return (
    <>
      <BreadcrumbNav items={getBreadcrumbItems(storeId)} />
      <Heading title="Add Product" />
      <ProductForm categories={categories} options={options} />
    </>
  );
}
