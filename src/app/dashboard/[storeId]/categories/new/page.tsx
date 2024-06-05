import CategoryForm from '../_components/CategoryForm';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import Heading from '@/components/Heading';

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
  return (
    <>
      <Heading title="Add Category" />
      <BreadcrumbNav items={getBreadcrumbItems(params.storeId)} />
      <CategoryForm />
    </>
  );
}
