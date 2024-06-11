import OrdersTable from './_components/OrdersTable';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import Heading from '@/components/Heading';
import NoData from '@/components/NoData';
import db from '@/db';

const getBreadcrumbItems = (storeId: string) => [
  { name: 'Dashboard', href: `/dashboard/${storeId}` },
  { name: 'Orders' },
];

export default async function SizesPage({
  params,
}: {
  params: { storeId: string };
}) {
  const { storeId } = params;

  const orders = await db.order.findMany({
    where: { storeId },
    include: { orderItems: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <Heading title="Orders" />
      {orders?.length > 0 && (
        <>
          <BreadcrumbNav items={getBreadcrumbItems(storeId)} />
          <OrdersTable orders={orders} />
        </>
      )}

      {orders?.length === 0 && (
        <NoData
          title="No orders yet"
          subtitle="You haven't received any orders yet."
        />
      )}
    </>
  );
}
