import CategoryForm from '../_components/CategoryForm';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import Heading from '@/components/Heading';
import { getCategories } from '@/db/categories';
import { CategoryTypeWithRelations } from '@/types';

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
  const categories = await getCategories({
    storeId,
    page: 1,
    pageSize: 100,
    withChildCategories: true,
  });

  return (
    <>
      <Heading title="Add Category" />
      <BreadcrumbNav items={getBreadcrumbItems(params.storeId)} />
      <CategoryForm
        categories={categories.categories as CategoryTypeWithRelations[]}
      />
    </>
  );
}
