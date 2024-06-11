import db from '@/db';

interface GraphData {
  name: string;
  total: number;
}

export const getGraphRevenue = async (storeId: string) => {
  const paidOrders = await db.order.findMany({
    where: { storeId, isPaid: true },
  });

  const monthlyRevenue: { [key: number]: number } = {};

  for (const order of paidOrders) {
    const month = order.createdAt.getMonth();

    monthlyRevenue[month] =
      (monthlyRevenue[month] || 0) + order.totalPrice.toNumber() / 100;
  }
  const graphData: Array<GraphData> = [
    { name: 'Jan', total: 0 },
    { name: 'Feb', total: 0 },
    { name: 'Mar', total: 0 },
    { name: 'Apr', total: 0 },
    { name: 'May', total: 0 },
    { name: 'Jun', total: 0 },
    { name: 'Jul', total: 0 },
    { name: 'Aug', total: 0 },
    { name: 'Sep', total: 0 },
    { name: 'Oct', total: 0 },
    { name: 'Nov', total: 0 },
    { name: 'Dec', total: 0 },
  ];

  for (const month in monthlyRevenue) {
    graphData[parseInt(month)].total = monthlyRevenue[parseInt(month)];
  }
  return graphData;
};

export const getSalesCount = async (storeId: string) => {
  return await db.order.count({ where: { storeId, isPaid: true } });
};

export const getStockCount = async (storeId: string) => {
  return await db.product.count({ where: { storeId, isArchived: false } });
};

export const getTotalRevenue = async (storeId: string) => {
  const paidOrders = await db.order.findMany({
    where: { storeId, isPaid: true },
  });

  return paidOrders.reduce((total, order) => {
    return total + order.totalPrice.toNumber() / 100;
  }, 0);
};
