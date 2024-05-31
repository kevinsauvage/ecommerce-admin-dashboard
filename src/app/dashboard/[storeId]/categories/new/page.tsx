import CategoryForm from '../_components/CategoryForm';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import Heading from '@/components/Heading';
import db from '@/db/db';
import { CategoriesTypeWithChildrenCategories } from '@/types';

const getBreadcrumbItems = (storeId: string) => [
  { name: 'Dashboard', href: `/dashboard/${storeId}` },
  { name: 'Categories', href: `/dashboard/${storeId}/categories` },
  { name: 'Add new Category' },
];

export default async function CategoryEditPage({
  params,
}: {
  params: { storeId: string; categoryId: string };
}) {
  const { storeId } = params;
  const categories = await db.category.findMany({
    where: { storeId, parentId: null },
    orderBy: { name: 'asc' },
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
  return (
    <>
      <Heading title="Add Category" />
      <BreadcrumbNav items={getBreadcrumbItems(params.storeId)} />
      <CategoryForm
        categories={categories as Array<CategoriesTypeWithChildrenCategories>}
      />
    </>
  );
}
