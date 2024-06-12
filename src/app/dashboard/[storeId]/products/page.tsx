import { Product } from '@prisma/client';
import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import ProductsTable from './_components/ProductsTable';
import { pageSize, sortOptions } from './_config/page.config';
import Filters from '@/components/Filters';
import Form from '@/components/Form';
import Heading from '@/components/Heading';
import NoData from '@/components/NoData';
import PaginationComponent from '@/components/PaginationComponent';
import Sorting from '@/components/Sorting';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getCategories } from '@/db/categories';
import { getProducts } from '@/db/products';

type Filters = {
  status: string[];
  categoryId: string[];
  [key: string]: string[];
};

const statusFilters = {
  label: 'Status',
  key: 'status',
  options: [
    { label: 'Archived', key: 'archived' },
    { label: 'Featured', key: 'featured' },
  ],
};

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: { storeId: string };
  searchParams: {
    status?: string;
    categoryId?: string;
    page?: string;
    query?: string;
    sort?: string;
  };
}) {
  const { storeId } = params;
  const { status, categoryId, page, query, sort } = searchParams;

  const categories = await getCategories({
    storeId,
    page: 1,
    pageSize: 100,
    sort: 'newest',
  });

  const categoriesFilters = {
    label: 'Category',
    key: 'categoryId',
    options: categories?.categories.map((category) => ({
      label: category.name,
      key: category.id,
    })),
  };

  // eslint-disable-next-line react-perf/jsx-no-new-array-as-prop
  const filterOptions = [statusFilters, categoriesFilters];

  const { products, count } = await getProducts({
    storeId,
    page: Number(page ?? 1),
    query,
    sort,
    pageSize,
    isArchived: status?.includes('archived'),
    isFeatured: status?.includes('featured'),
    withCategories: true,
    categoryIds: categoryId ? categoryId.split(',') : undefined,
  });

  const productsSearchAction = async (payload: FormData) => {
    'use server';
    const query = payload.get('query') as string;
    redirect(`/dashboard/${storeId}/products?query=${query}`);
  };

  // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop
  const selectedFilters = {
    status: status ? status.split(',') : [],
    categoryId: categoryId ? categoryId.split(',') : [],
  };

  return (
    <>
      <Heading title="Products" />
      <div className="flex flex-col gap-2 h-full">
        {(status?.length ||
          categoryId?.length ||
          products?.length > 0 ||
          query) && (
          <div className="flex flex-col-reverse gap-2 sm:flex-row items-center justify-between">
            <Form
              action={productsSearchAction}
              className="relative w-full flex-1 md:grow-0"
            >
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                name="query"
                type="search"
                defaultValue={query}
                placeholder="Search..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
              />
            </Form>
            <div className="ml-auto flex items-center gap-2">
              <Filters
                selectedFilters={selectedFilters}
                filterOptions={filterOptions}
              />
              <Sorting searchParams={searchParams} sortOptions={sortOptions} />
              <Button size="sm" className="h-8 gap-1">
                <Link
                  href={`/dashboard/${storeId}/products/new`}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Product
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        )}

        {products?.length > 0 ? (
          <ListingComponent products={products} count={count} page={page} />
        ) : (
          <NoDataComponent storeId={storeId} />
        )}
      </div>
    </>
  );
}

function ListingComponent({
  products,
  count,
  page,
}: {
  products: Product[];
  count: number;
  page: string | undefined;
}) {
  return (
    <>
      <Card>
        <CardContent className="p-0">
          <ProductsTable products={JSON.parse(JSON.stringify(products))} />
        </CardContent>
      </Card>
      <PaginationComponent
        className="justify-end"
        count={count}
        currentPage={page ? Number(page) : 1}
        perPage={pageSize}
      />
    </>
  );
}

function NoDataComponent({ storeId }: { storeId: string }) {
  return (
    <NoData
      title="No products"
      subtitle="You can start selling as soon as you add a product."
    >
      <Button size="sm" className="h-8 gap-1 mt-4">
        <Link
          href={`/dashboard/${storeId}/products/new`}
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Product
          </span>
        </Link>
      </Button>
    </NoData>
  );
}
