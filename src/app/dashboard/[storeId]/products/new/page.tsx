import ProductForm from '../_components/ProductForm';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import Heading from '@/components/Heading';
import { getCategories } from '@/db/categories';
import { getOptions } from '@/db/options';

const getData = async (productId: string, storeId: string) => {
  return Promise.all([
    getCategories({
      storeId,
      page: 1,
      pageSize: 100,
      withChildCategories: true,
      onlyParentCategories: true,
    }),
    getOptions({ storeId, page: 1, pageSize: 100 }),
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
      <ProductForm
        categories={categories.categories}
        options={options.options}
      />
    </>
  );
}
