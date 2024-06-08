import NavigationForm from '../_components/NavigationForm';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import Heading from '@/components/Heading';
import { getCategories } from '@/db/categories';

const getBreadcrumbItems = (storeId: string) => [
  { name: 'Dashboard', href: `/dashboard/${storeId}` },
  { name: 'Navigation', href: `/dashboard/${storeId}/navigation` },
  { name: 'Add new Navigation' },
];

export default async function NavigationNewPage({
  params,
}: {
  params: { storeId: string };
}) {
  const { storeId } = params;
  const categories = await getCategories({
    storeId,
    page: 1,
    pageSize: 100,
  });

  return (
    <>
      <BreadcrumbNav items={getBreadcrumbItems(storeId)} />
      <Heading title="Add Navigation" />
      <NavigationForm categories={categories.categories} />
    </>
  );
}
