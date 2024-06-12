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

export default function Filters({
  selectedFilters = {},
  filterOptions = [],
}: {
  selectedFilters?: {
    [key: string]: string[];
  };
  filterOptions?: {
    label: string;
    key: string;
    options: Array<{
      key: string;
      label: string;
    }>;
  }[];
}) {
  const headerList = headers();
  const pathname = headerList.get('x-current-path');

  const getUrl = (key: string, filter: string) => {
    const newSearchParams = new URLSearchParams();

    const newSelectedFilters = { ...selectedFilters };

    filterOptions.forEach((f) => {
      if (f.key !== key) return;

      if (selectedFilters[f.key]?.includes(filter)) {
        newSelectedFilters[f.key] = selectedFilters[f.key]?.filter(
          (f) => f !== filter
        );
      } else {
        newSelectedFilters[f.key] = [...(selectedFilters[f.key] || []), filter];
      }
    });

    Object.entries(newSelectedFilters).forEach(([key, value]) => {
      if (value.length > 0) {
        newSearchParams.set(key, value.join(','));
      }
    });

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
            {Object.values(selectedFilters).flat().length > 0 && (
              <Badge className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                {Object.values(selectedFilters).flat().length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {filterOptions.map((filter, i) => (
            <div key={filter.key}>
              {i > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel key={filter.label}>
                {filter.label}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filter.options.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.key}
                  checked={selectedFilters[filter.key]?.includes(option.key)}
                  asChild
                >
                  <Link
                    href={getUrl(filter.key, option.key)}
                    className="w-full h-full"
                  >
                    {option.label}
                  </Link>
                </DropdownMenuCheckboxItem>
              ))}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
