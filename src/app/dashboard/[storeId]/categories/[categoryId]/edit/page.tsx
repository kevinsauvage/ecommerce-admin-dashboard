import { redirect } from 'next/navigation';

import CategoryForm from '../../_components/CategoryForm';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import Heading from '@/components/Heading';
import { getCategories, getCategory } from '@/db/categories';
import { CategoryTypeWithRelations } from '@/types';

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

  const [category, categories] = await Promise.all([
    getCategory({
      storeId,
      categoryId,
      withChildCategories: true,
    }),
    getCategories({
      storeId,
      page: 1,
      pageSize: 100,
      withChildCategories: true,
      whereExtra: { id: { not: categoryId } },
    }),
  ]);

  if (!category) {
    redirect(`/dashboard/${storeId}/categories`);
  }

  return (
    <>
      <Heading title="Edit Category" />
      <BreadcrumbNav items={getBreadcrumbItems(storeId)} />
      <CategoryForm
        category={category}
        categories={categories.categories as CategoryTypeWithRelations[]}
      />
    </>
  );
}
