/* eslint-disable react-perf/jsx-no-new-object-as-prop */
'use client';

import { Store } from '@prisma/client';
import { Check, ChevronsUpDown, PlusCircle, StoreIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { ComponentPropsWithoutRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type PopoverTriggerProps = ComponentPropsWithoutRef<typeof PopoverTrigger>;

interface StoreSwitcherProps extends PopoverTriggerProps {
  stores: Array<Store>;
}

export default function StoreSwitcher({ stores }: StoreSwitcherProps) {
  const [isOpen, setOpen] = useState(false);
  const params = useParams();
  const router = useRouter();

  const currentStore = stores.find((store) => store.id === params.storeId);

  const onStoreSelect = (storeId: string) => {
    router.push(`/dashboard/${storeId}`);
    setOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-label="Switch store"
          aria-expanded={isOpen}
          className="flex items-center gap-2"
        >
          <StoreIcon size={22} />
          {currentStore?.name || 'Select store'}
          <ChevronsUpDown size={16} />
          <span className="sr-only">Switch store</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200]">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search stores" />
            <CommandEmpty>No store found.</CommandEmpty>
            <CommandGroup heading="Stores">
              {stores.map((store) => (
                <CommandItem
                  key={store.id}
                  onSelect={() => onStoreSelect(store.id)}
                  className="flex items-center gap-2"
                >
                  <StoreIcon size={16} />
                  {store.name}
                  <Check
                    size={16}
                    className="ml-auto"
                    style={{
                      display: store.id === currentStore?.id ? '' : 'none',
                    }}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => router.push('/setup')}
                className="flex items-center gap-2"
              >
                <PlusCircle size={16} />
                Create Store
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
