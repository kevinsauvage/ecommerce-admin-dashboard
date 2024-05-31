import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import CategoriesTable from './_components/CategoriesTable';
import { pageSize, sortOptions } from './_config/page.config';
import Form from '@/components/Form';
import Heading from '@/components/Heading';
import NoData from '@/components/NoData';
import PaginationComponent from '@/components/PaginationComponent';
import Sorting from '@/components/Sorting';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const BASE_URL = process.env.NEXT_BASE_URL;

const getData = async (
  storeId: string,
  searchParams: {
    page?: string;
    query?: string;
    sort?: string;
  }
) => {
  const url = new URL(`${BASE_URL}/api/${storeId}/categories`);

  const params = new URLSearchParams(searchParams);

  params.set('pageSize', pageSize.toString());
  params.set('withChildCategories', 'true');
  params.set('onlyParentCategories', 'true');

  url.search = params.toString();

  const response = await fetch(url);
  return await response.json();
};

export default async function CategoriesPage({
  params,
  searchParams,
}: {
  params: { storeId: string };
  searchParams: {
    page?: string;
    query?: string;
    sort?: string;
  };
}) {
  const { storeId } = params;
  const { page, query } = searchParams;
  const { categories, count } = await getData(storeId, searchParams);

  const categorySearchAction = async (payload: FormData) => {
    'use server';
    const query = payload.get('query') as string;
    redirect(`/dashboard/${storeId}/categories?query=${query}`);
  };

  return (
    <>
      <Heading title="Categories" />
      <div className="flex flex-col gap-2 h-full">
        {(categories?.length > 0 || query) && (
          <div className="flex flex-col-reverse sm:flex-row gap-2 items-center justify-between">
            <Form
              action={categorySearchAction}
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
              <Sorting searchParams={searchParams} sortOptions={sortOptions} />
              <Button size="sm" className="h-8 gap-1">
                <Link
                  href={`/dashboard/${storeId}/categories/new`}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add a category
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        )}
        {categories?.length > 0 ? (
          <>
            <Card>
              <CardContent>
                <CategoriesTable categories={categories} />
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
            title="No categories"
            subtitle="You haven't added any categories yet."
          >
            <Button className="h-8 gap-1 mt-4">
              <Link
                href={`/dashboard/${storeId}/categories/new`}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add a category
                </span>
              </Link>
            </Button>
          </NoData>
        )}
      </div>
    </>
  );
}
