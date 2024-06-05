'use client';

import { Category } from '@prisma/client';
import { Command as CommandPrimitive } from 'cmdk';
import { X } from 'lucide-react';
import { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';

import { Badge } from './ui/badge';
import { Command, CommandGroup, CommandItem, CommandList } from './ui/command';
import { CategoryTypeWithRelations } from '@/types';

const categorySelectRecursive = (
  categories: Array<CategoryTypeWithRelations>,
  setInputValue: (value: string) => void,
  handleSelect: (value: Category) => void,
  selected: Category[]
) => {
  return categories.map((category) => {
    if (category.childCategories.length > 0) {
      return (
        <>
          <CommandGroup className="h-full overflow-auto" key={category.id}>
            <CommandItem
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onSelect={() => {
                setInputValue('');
                handleSelect(category);
              }}
              className={'cursor-pointer'}
              disabled={
                selected.find((s) => s.id === category.id) !== undefined
              }
            >
              {category.name}
            </CommandItem>
          </CommandGroup>
          <div className="ml-4">
            {categorySelectRecursive(
              category.childCategories as Array<CategoryTypeWithRelations>,
              setInputValue,
              handleSelect,
              selected
            )}
          </div>
        </>
      );
    } else {
      return (
        <CommandGroup className="h-full overflow-auto" key={category.id}>
          <CommandItem
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onSelect={() => {
              setInputValue('');
              handleSelect(category);
            }}
            className={'cursor-pointer'}
            disabled={selected.find((s) => s.id === category.id) !== undefined}
          >
            {category.name}
          </CommandItem>
        </CommandGroup>
      );
    }
  });
};

export default function CategorySelector({
  categories,
  selectedCategories = [],
  onChange,
}: {
  categories: Array<CategoryTypeWithRelations>;
  selectedCategories: Array<Category>;
  onChange: (categories: Category[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Array<Category>>(selectedCategories);

  const [inputValue, setInputValue] = useState('');

  const handleUnselect = useCallback((category: Category) => {
    setSelected((prev) => prev.filter((c) => c.id !== category.id));
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (input) {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (input.value === '') {
          setSelected((prev) => {
            const newSelected = [...prev];
            newSelected.pop();
            return newSelected;
          });
        }
      }
      if (e.key === 'Escape') {
        input.blur();
      }
    }
  }, []);

  useEffect(() => {
    onChange(selected);
  }, [onChange, selected]);

  return (
    <Command
      onKeyDown={handleKeyDown}
      className="overflow-visible bg-transparent"
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selected.map((category) => {
            return (
              <Badge key={category.id} variant="secondary">
                {category.name}
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUnselect(category);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(category)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
          {/* Avoid having the "Search" Icon */}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder="Select categories..."
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative mt-2">
        <CommandList>
          {open && categories.length > 0 ? (
            <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              {categorySelectRecursive(
                categories,
                setInputValue,
                (value) => {
                  setInputValue('');
                  setSelected((prev) => [...prev, value]);
                },
                selected
              )}
            </div>
          ) : null}
        </CommandList>
      </div>
    </Command>
  );
}
