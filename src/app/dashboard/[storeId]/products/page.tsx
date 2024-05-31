import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import ProductsTable from './_components/ProductsTable';
import { filterOptions, pageSize, sortOptions } from './_config/page.config';
import Filters from '@/components/Filters';
import Form from '@/components/Form';
import Heading from '@/components/Heading';
import NoData from '@/components/NoData';
import PaginationComponent from '@/components/PaginationComponent';
import Sorting from '@/components/Sorting';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const BASE_URL = process.env.VERCEL_URL;

const getData = async (
  storeId: string,
  searchParams: {
    filter?: string;
    page?: string;
    query?: string;
    sort?: string;
  }
) => {
  const url = new URL(`${BASE_URL}/api/${storeId}/products`);

  const params = new URLSearchParams(searchParams);

  params.set('pageSize', pageSize.toString());

  url.search = params.toString();

  const response = await fetch(url);
  return await response.json();
};

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: { storeId: string };
  searchParams: {
    filter?: string;
    page?: string;
    query?: string;
    sort?: string;
  };
}) {
  const { storeId } = params;
  const { filter, page, query } = searchParams;
  const { products, count } = await getData(storeId, searchParams);

  const productsSearchAction = async (payload: FormData) => {
    'use server';
    const query = payload.get('query') as string;
    redirect(`/dashboard/${storeId}/products?query=${query}`);
  };

  return (
    <>
      <Heading title="Products" />
      <div className="flex flex-col gap-2 h-full">
        {(filter?.length || products?.length > 0 || query) && (
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
                searchParams={searchParams}
                filterOptions={filterOptions}
                label="Status"
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
          <>
            <Card>
              <CardContent>
                <ProductsTable
                  products={JSON.parse(JSON.stringify(products))}
                />
              </CardContent>
            </Card>
            <PaginationComponent
              className="justify-end"
              count={count}
              currentPage={page ? Number(page) : 1}
              perPage={pageSize}
            />
          </>
        ) : (
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
        )}
      </div>
    </>
  );
}
