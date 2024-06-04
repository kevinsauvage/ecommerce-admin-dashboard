import CategoriesTable from '../_components/CategoriesTable';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import Heading from '@/components/Heading';
import { Card, CardContent } from '@/components/ui/card';
import { getCategory } from '@/db/categories';
import { CategoryTypeWithRelations } from '@/types';

const getCategoryBreadcrumb = (category: CategoryTypeWithRelations) => {
  const breadcrumb = [];

  let currentCategory = category;
  while (currentCategory) {
    breadcrumb.unshift({
      name: currentCategory.name,
      href: `/dashboard/${currentCategory.storeId}/categories/${currentCategory.id}`,
    });
    // @ts-expect-error - TS doesn't know that parent is included
    currentCategory = currentCategory.parent;
  }

  return [
    { name: 'Dashboard', href: `/dashboard/${category.storeId}` },
    { name: 'Categories', href: `/dashboard/${category.storeId}/categories` },
    ...breadcrumb,
  ];
};

export default async function CategoriesPage({
  params,
}: {
  params: { storeId: string; categoryId: string };
}) {
  const { storeId, categoryId } = params;

  const category = await getCategory({
    storeId,
    categoryId,
    withChildCategories: true,
    withParentCategory: true,
  });

  return (
    <>
      <Heading title={`Category (${category?.name})`} />
      <BreadcrumbNav
        items={getCategoryBreadcrumb(category as CategoryTypeWithRelations)}
      />
      <Card>
        <CardContent className="p-0">
          <CategoriesTable
            categories={
              category?.childCategories as Array<CategoryTypeWithRelations>
            }
          />{' '}
        </CardContent>
      </Card>
    </>
  );
}
