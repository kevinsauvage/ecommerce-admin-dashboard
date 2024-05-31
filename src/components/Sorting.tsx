import { ArrowUpDownIcon } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  DropdownMenuTrigger,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuContent,
  DropdownMenu,
} from '@/components/ui/dropdown-menu';

export default function Sorting({
  searchParams = { sort: '' },
  sortOptions = [],
}: {
  searchParams?: { sort?: string };
  sortOptions: Array<{
    key: string;
    label: string;
  }>;
}) {
  const headerList = headers();
  const pathname = headerList.get('x-current-path');

  const getUrl = (sortKey: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('sort', sortKey);
    return `${pathname}?${newSearchParams.toString()}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex items-center gap-2" variant="outline" size="sm">
          <ArrowUpDownIcon className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Sort by
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuRadioGroup
          value={searchParams.sort || sortOptions.at(0)?.key}
        >
          {sortOptions.map((row) => (
            <DropdownMenuRadioItem key={row.key} value={row.key}>
              <Link href={getUrl(row.key)}>{row.label}</Link>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
