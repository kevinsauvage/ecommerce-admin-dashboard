import { Prisma } from '@prisma/client';

export const pageSize = 10;

export const sortOptions = [
  {
    key: 'newest',
    label: 'Newest',
    sort: { createdAt: Prisma.SortOrder.desc },
  },
  { key: 'oldest', label: 'Oldest', sort: { createdAt: Prisma.SortOrder.asc } },
  {
    key: 'price-low-to-high',
    label: 'Price: Low to High',
    sort: { price: Prisma.SortOrder.asc },
  },
  {
    key: 'price-high-to-low',
    label: 'Price: High to Low',
    sort: { price: Prisma.SortOrder.desc },
  },
  {
    key: 'stock-low-to-high',
    label: 'Stock: Low to High',
    sort: { stock: Prisma.SortOrder.asc },
  },
  {
    key: 'stock-high-to-low',
    label: 'Stock: High to Low',
    sort: { stock: Prisma.SortOrder.desc },
  },
  {
    key: 'name-asc',
    label: 'Name (A-Z)',
    sort: { name: Prisma.SortOrder.asc },
  },
  {
    key: 'name-desc',
    label: 'Name (Z-A)',
    sort: { name: Prisma.SortOrder.desc },
  },
];
