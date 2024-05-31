import { ListFilter } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ProductsFilters({
  searchParams = { filter: '' },
  filterOptions = [],
  label,
}: {
  searchParams?: { filter?: string };
  filterOptions?: Array<{
    key: string;
    label: string;
  }>;
  label: string;
}) {
  const headerList = headers();
  const pathname = headerList.get('x-current-path');
  const selected = searchParams.filter ? searchParams.filter?.split(',') : [];

  const getUrl = (filter: string) => {
    const newSearchParams = new URLSearchParams(searchParams);

    const newFilter = selected.includes(filter)
      ? selected.filter((f) => f !== filter)
      : [...selected, filter];

    newSearchParams.set('filter', newFilter.join(','));
    return `${pathname}?${newSearchParams.toString()}`;
  };

  return (
    <div className="ml-auto flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <ListFilter className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Filter
            </span>
            {selected.length > 0 && (
              <Badge className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                {selected.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {filterOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.key}
              checked={selected.includes(option.key)}
            >
              <Link href={getUrl(option.key)}>{option.label}</Link>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
