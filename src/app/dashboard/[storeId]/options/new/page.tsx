import OptionForm from '../_components/OptionForm';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import Heading from '@/components/Heading';

const getBreadcrumbItems = (storeId: string) => [
  { name: 'Dashboard', href: `/dashboard/${storeId}` },
  { name: 'Options', href: `/dashboard/${storeId}/options` },
  { name: 'Add new Option' },
];

export default async function OptionEditPage({
  params,
}: {
  params: { storeId: string };
}) {
  const { storeId } = params;

  return (
    <>
      <Heading title="Add Option" />
      <BreadcrumbNav items={getBreadcrumbItems(storeId)} />
      <OptionForm />
    </>
  );
}
