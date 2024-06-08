import NavigationForm from '../../_components/NavigationForm';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import Heading from '@/components/Heading';
import { getCategories } from '@/db/categories';
import { GetSingleNavigationById } from '@/db/navigation';
import { Navigation } from '@/types';

const getBreadcrumbItems = (storeId: string) => [
  { name: 'Dashboard', href: `/dashboard/${storeId}` },
  { name: 'Navigation', href: `/dashboard/${storeId}/navigation` },
  { name: 'Edit Navigation' },
];

export default async function NavigationEditPage({
  params,
}: {
  params: { storeId: string; navigationId: string };
}) {
  const { storeId, navigationId } = params;
  const navigation = await GetSingleNavigationById({ storeId, navigationId });
  const categories = await getCategories({
    storeId,
    page: 1,
    pageSize: 100,
  });

  return (
    <>
      <BreadcrumbNav items={getBreadcrumbItems(storeId)} />
      <Heading title={`Edit Navigation (${navigation?.name})`} />
      <NavigationForm
        navigation={navigation as Navigation}
        categories={categories.categories}
      />
    </>
  );
}
