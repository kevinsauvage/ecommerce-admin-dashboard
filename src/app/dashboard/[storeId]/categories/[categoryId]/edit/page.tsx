import { redirect } from 'next/navigation';

import CategoryForm from '../../_components/CategoryForm';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import Heading from '@/components/Heading';
import { getCategory } from '@/db/categories';

const getBreadcrumbItems = (storeId: string) => [
  { name: 'Dashboard', href: `/dashboard/${storeId}` },
  { name: 'Categories', href: `/dashboard/${storeId}/categories` },
  { name: 'Edit Category' },
];

export default async function CategoryEditPage({
  params,
}: {
  params: { storeId: string; categoryId: string };
}) {
  const { storeId, categoryId } = params;

  const [category] = await Promise.all([
    getCategory({
      storeId,
      categoryId,
    }),
  ]);

  if (!category) {
    redirect(`/dashboard/${storeId}/categories`);
  }

  return (
    <>
      <Heading title="Edit Category" />
      <BreadcrumbNav items={getBreadcrumbItems(storeId)} />
      <CategoryForm category={category} />
    </>
  );
}
