'use client';

import { usePathname, useSearchParams } from 'next/navigation';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';

type PaginationLinkProps = {
  count: number;
  currentPage: number;
  perPage: number;
  className?: string;
} & React.ComponentProps<typeof Pagination>;

export default function PaginationComponent({
  count,
  currentPage,
  perPage,
  className,
}: PaginationLinkProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(count / perPage);

  if (totalPages === 1) return null;

  const getPreviousUrl = () => {
    const previousPage = currentPage - 1;
    const params = new URLSearchParams(searchParams);
    params.set('page', previousPage.toString());
    return `${pathname}?${params.toString()}`;
  };

  const getNextUrl = () => {
    const nextPage = currentPage + 1;
    const params = new URLSearchParams(searchParams);
    params.set('page', nextPage.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center whitespace-nowrap text-sm py-2 pl-2.5">
        Page {currentPage} of {totalPages}
      </div>
      <Pagination className={className}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={getPreviousUrl()}
              className={
                currentPage <= 1 ? 'pointer-events-none opacity-60' : ''
              }
            />
          </PaginationItem>

          {currentPage > 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {currentPage > 1 && (
            <PaginationItem>
              <PaginationLink href={getPreviousUrl()}>
                {currentPage - 1}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationLink
              href={`${pathname}?${searchParams.toString()}`}
              isActive
            >
              {currentPage}
            </PaginationLink>
          </PaginationItem>

          {totalPages > currentPage && (
            <PaginationItem>
              <PaginationLink href={getNextUrl()}>
                {currentPage + 1}
              </PaginationLink>
            </PaginationItem>
          )}

          {totalPages > currentPage + 1 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              href={getNextUrl()}
              className={
                totalPages <= currentPage
                  ? 'pointer-events-none opacity-60'
                  : ''
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
