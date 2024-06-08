import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import NavigationTable from './_components/NavigationTable';
import { pageSize, sortOptions } from './_config/page.config';
import Form from '@/components/Form';
import Heading from '@/components/Heading';
import NoData from '@/components/NoData';
import PaginationComponent from '@/components/PaginationComponent';
import Sorting from '@/components/Sorting';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getNavigation } from '@/db/navigation';

export default async function NavigationPage({
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

  const { navigation, count } = await getNavigation({
    storeId,
    page: Number(searchParams.page ?? 1),
    query: searchParams.query,
    sort: searchParams.sort,
    pageSize,
  });

  const navigationSearchAction = async (payload: FormData) => {
    'use server';
    const query = payload.get('query') as string;
    redirect(`/dashboard/${storeId}/navigation?query=${query}`);
  };
  return (
    <>
      <Heading title="Navigation" />
      <div className="flex flex-col gap-2 h-full">
        {(navigation?.length > 0 || query) && (
          <div className="flex flex-col-reverse gap-2 sm:flex-row items-center justify-between">
            <Form
              action={navigationSearchAction}
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
                  href={`/dashboard/${storeId}/navigation/new`}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add navigation
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        )}
        {navigation?.length > 0 ? (
          <>
            <Card>
              <CardContent className="p-0">
                <NavigationTable navigation={navigation} />
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
            title="No navigation"
            subtitle="You haven't added any product navigation yet."
          >
            <Button size="sm" className="h-8 gap-1 mt-4">
              <Link
                href={`/dashboard/${storeId}/navigation/new`}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add navigation
                </span>
              </Link>
            </Button>
          </NoData>
        )}
      </div>
    </>
  );
}
