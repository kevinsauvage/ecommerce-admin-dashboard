import { redirect } from 'next/navigation';

import CategoryForm from '../../_components/CategoryForm';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import Heading from '@/components/Heading';
import db from '@/db/db';
import { CategoriesTypeWithChildrenCategories } from '@/types';

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

  const category = await db.category.findUnique({ where: { id: categoryId } });
  const categories = await db.category.findMany({
    where: {
      storeId,
      id: { not: categoryId },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      childCategories: {
        include: {
          childCategories: {
            include: {
              childCategories: true,
            },
          },
        },
      },
    },
  });

  if (!category) {
    redirect(`/dashboard/${storeId}/categories`);
  }

  return (
    <>
      <Heading title="Edit Category" />
      <BreadcrumbNav items={getBreadcrumbItems(storeId)} />
      <CategoryForm
        category={category}
        categories={categories as Array<CategoriesTypeWithChildrenCategories>}
      />
    </>
  );
}
