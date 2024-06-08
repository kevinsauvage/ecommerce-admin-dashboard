'use client';

import { Category } from '@prisma/client';
import { ChevronsUpDown, Edit, Grip, Plus, Trash } from 'lucide-react';
import { useParams } from 'next/navigation';
import { DragEvent, useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { addNavigation, updateNavigation } from '@/actions/navigationActions';
import Form from '@/components/Form';
import FormErrorMessage from '@/components/FormErrorMessage';
import FormInputWrapper from '@/components/FormInputWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Navigation, NavigationInputItem, NavigationItem } from '@/types';

interface Action {
  name?: string[];
  values?: string[];
  error?: string;
}

const renderRecursive = (
  items: NavigationInputItem[],
  handleDragStart: (
    e: DragEvent<HTMLDivElement>,
    item: NavigationInputItem
  ) => void,
  handleDragOver: (item: NavigationInputItem) => void,
  handleDrop: (item: NavigationInputItem) => void,
  handleDragEnd: () => void,
  handleDelete: (id: string) => void,
  handleEdit: (item: NavigationInputItem) => void,
  setIsParent: (isParent: boolean) => void,
  isParent: boolean,
  dragOveredItem?: NavigationInputItem | null,
  dragItem?: NavigationInputItem | null,
  level: number = 0
) => {
  return items.map((item, i) => (
    <div
      key={item.id}
      aria-label={item.name + i}
      className={cn({
        'pointer-events-none opacity-50': dragItem?.id === item.id,
        'pointer-events-none': dragItem && level > 2,
      })}
    >
      <Collapsible className="w-full" defaultOpen>
        <div
          draggable
          className={cn(
            'relative flex items-center gap-4 w-full border p-2 py-4 sm:p-4 rounded'
          )}
          onDragStart={(e) => handleDragStart(e, item)}
          onDragOver={(e) => {
            e.preventDefault();
            handleDragOver(item);
          }}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop(item);
          }}
          onDragEnd={() => {
            handleDragEnd();
          }}
        >
          <div className="h-full" onDragOver={() => setIsParent(true)}>
            <Grip className="cursor-grab" size={20} />
          </div>

          <div className="w-full flex justify-between gap-x-2 gap-y-1">
            <div
              className="flex items-center gap-2 flex-wrap"
              onDragOver={() => setIsParent(false)}
            >
              <span>{item.name}</span>
              {item.url && <Badge> {item.url}</Badge>}
              {item.category?.name && (
                <Badge variant="secondary"> {item.category?.name}</Badge>
              )}
            </div>
            <div className="flex gap-1">
              {item.items && item.items?.length > 0 && (
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 sm:w-9 sm:h-9 p-0"
                  >
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              )}
              <Button
                variant="default"
                size="icon"
                className="w-8 h-8 sm:w-9 sm:h-9 p-0"
                type="button"
                onClick={() => handleEdit(item)}
              >
                <Edit size={14} />
                <span className="sr-only">Edit</span>
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="w-8 h-8 sm:w-9 sm:h-9 p-0"
                type="button"
                onClick={() => handleDelete(item.id)}
              >
                <Trash size={14} />

                <span className="sr-only">Delete</span>
              </Button>
              <div
                className={cn('', {
                  'absolute h-1 bottom-0 right-0 left-0 bg-primary':
                    dragOveredItem?.id === item.id,
                  'left-10': !isParent,
                })}
              />
            </div>
          </div>
        </div>
        {item.items && item.items?.length > 0 && (
          <CollapsibleContent className="ml-8">
            {renderRecursive(
              item.items,
              handleDragStart,
              handleDragOver,
              handleDrop,
              handleDragEnd,
              handleDelete,
              handleEdit,
              setIsParent,
              isParent,
              dragOveredItem,
              dragItem,
              level + 1
            )}
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  ));
};

const formatOriginalNavigation = (
  navigation: NavigationItem[],
  categories: Category[]
) => {
  const format = (items: NavigationItem[]): NavigationInputItem[] => {
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      url: item.url,
      category: categories.find((category) => category.id === item.categoryId),
      items: item.items?.length ? format(item.items) : [],
    }));
  };

  return format(navigation);
};

export default function NavigationForm({
  navigation,
  categories,
}: {
  navigation?: Navigation;
  categories: Category[];
}) {
  const { storeId } = useParams() as { storeId: string };
  const { toast } = useToast();
  const [navigationItems, setNavigationItems] = useState<NavigationInputItem[]>(
    formatOriginalNavigation(navigation?.items || [], categories)
  );
  const [currentItem, setCurrentItem] = useState<NavigationInputItem | null>(
    null
  );
  const [itemError, setItemError] = useState<
    Partial<Record<keyof NavigationInputItem, string[]>>
  >({});
  const [open, setOpen] = useState(false);
  const [dragItem, setDragItem] = useState<NavigationInputItem | null>(null);
  const [dragOveredItem, setDragOveredItem] =
    useState<NavigationInputItem | null>(null);
  const [isParent, setIsParent] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [error, action] = useFormState<Action, FormData>(
    navigation
      ? updateNavigation.bind(null, storeId, navigation.id, navigationItems)
      : addNavigation.bind(null, storeId, navigationItems),
    {}
  );

  useEffect(() => {
    if (error?.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.error,
      });
    }
  }, [error, toast]);

  const replaceItemRecursive = (
    items: NavigationInputItem[],
    item: NavigationInputItem
  ): NavigationInputItem[] => {
    return items.reduce(
      (acc: NavigationInputItem[], i: NavigationInputItem) => {
        if (i.id === item.id) {
          return [...acc, item];
        }

        if (i.items) {
          return [...acc, { ...i, items: replaceItemRecursive(i.items, item) }];
        }

        return [...acc, i];
      },
      []
    );
  };

  const handleSaveItem = () => {
    if (!currentItem?.name) {
      setItemError({ name: ['Name is required'] });
      return;
    }

    if (!currentItem?.url) {
      setItemError({ url: ['URL is required'] });
      return;
    }

    if (isEdit) {
      const updatedItems = replaceItemRecursive(navigationItems, currentItem);
      setNavigationItems(updatedItems);
    } else {
      setNavigationItems([...navigationItems, currentItem]);
    }

    setCurrentItem(null);
    setOpen(false);
    setIsEdit(false);
  };

  const handleEdit = (item: NavigationInputItem) => {
    setCurrentItem(item);
    setOpen(true);
    setIsEdit(true);
  };

  const removeItem = (id: string) => {
    const remove = (items: NavigationInputItem[]): NavigationInputItem[] => {
      return items.reduce(
        (acc: NavigationInputItem[], item: NavigationInputItem) => {
          if (item.id === id) {
            return acc;
          }

          if (item.items) {
            return [...acc, { ...item, items: remove(item.items) }];
          }

          return [...acc, item];
        },
        []
      );
    };
    return remove(navigationItems);
  };

  const handleDelete = (id: string) => {
    setNavigationItems(removeItem(id));
  };

  const handleDragStart = (
    e: DragEvent<HTMLDivElement>,
    item: NavigationInputItem
  ) => {
    const target = e.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const sideThreshold = 2.5 * 16;
    const isDraggable =
      e.clientX < rect.left + sideThreshold ||
      e.clientX > rect.right - sideThreshold;

    if (!isDraggable) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.setDragImage(
      target,
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    );

    setTimeout(() => {
      setDragItem(item);
    }, 0);
  };

  const handleDragOver = (item: NavigationInputItem) => {
    setDragOveredItem(item);
  };

  const handleDrop = (droppedOnItem: NavigationInputItem) => {
    if (!dragItem || dragItem?.id === droppedOnItem?.id) {
      setDragItem(null);
      setDragOveredItem(null);
      return;
    }

    const insertItem = (
      items: NavigationInputItem[]
    ): NavigationInputItem[] => {
      return items.reduce(
        (acc: NavigationInputItem[], item: NavigationInputItem) => {
          if (item.id === dragItem?.id) return acc;

          if (item.id === droppedOnItem.id) {
            if (isParent) return [...acc, item, dragItem];

            return [
              ...acc,
              { ...item, items: [...(item.items || []), dragItem] },
            ];
          }

          if (item.items) {
            return [...acc, { ...item, items: insertItem(item.items) }];
          }

          return [...acc, item];
        },
        []
      );
    };

    setTimeout(() => {
      const newItems = removeItem(dragItem.id);
      const updatedItems = insertItem(newItems);
      if (getNavigationDepth(updatedItems) > 4) {
        toast({
          variant: 'destructive',
          title: 'Error:',
          description: 'Navigation depth cannot be more than 4',
        });
        return;
      }
      setNavigationItems(updatedItems);
      setDragItem(null);
      setDragOveredItem(null);
    }, 0);
  };

  const handleDragEnd = () => {
    setDragItem(null);
    setDragOveredItem(null);
  };

  const getNavigationDepth = (
    items: NavigationInputItem[],
    currentDepth = 0
  ): number => {
    if (items.length === 0) return currentDepth;

    const depths = items.map((item) =>
      getNavigationDepth(item.items || [], currentDepth + 1)
    );
    return Math.max(...depths);
  };

  return (
    <Form action={action}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Items</CardTitle>
              <CardDescription>Add the navigation items</CardDescription>
            </CardHeader>
            <CardContent>
              {renderRecursive(
                navigationItems,
                handleDragStart,
                handleDragOver,
                handleDrop,
                handleDragEnd,
                handleDelete,
                handleEdit,
                setIsParent,
                isParent,
                dragOveredItem,
                dragItem
              )}
            </CardContent>
            <CardFooter className="border-t flex items-center justify-center pb-0">
              <Sheet
                open={open}
                onOpenChange={() => {
                  if (!open) {
                    setCurrentItem(null);
                    setIsEdit(false);
                  }
                  setOpen((prev) => !prev);
                }}
              >
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex gap-2 m-4">
                    <Plus className="h-5 w-5" />
                    <span>Add new item</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col">
                  <SheetHeader>
                    <SheetTitle>Add Navigation Item</SheetTitle>
                    <SheetDescription>
                      Fill in the details of the navigation item
                    </SheetDescription>
                  </SheetHeader>

                  <div className="grid gap-3">
                    <FormInputWrapper>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        type="text"
                        id="name"
                        placeholder="Navigation item name"
                        value={currentItem?.name ?? ''}
                        onChange={(e) =>
                          setCurrentItem({
                            id: currentItem?.id ?? crypto.randomUUID(),
                            url: currentItem?.url ?? '',
                            name: e.target.value,
                            category: currentItem?.category,
                            items: [],
                          })
                        }
                      />
                      <FormErrorMessage message={itemError?.name} />
                    </FormInputWrapper>
                    <FormInputWrapper>
                      <Label htmlFor="url">URL</Label>
                      <Input
                        type="text"
                        id="url"
                        placeholder="Navigation item URL"
                        value={currentItem?.url ?? ''}
                        onChange={(e) =>
                          setCurrentItem({
                            id: currentItem?.id ?? crypto.randomUUID(),
                            name: currentItem?.name ?? '',
                            url: e.target.value,
                            category: currentItem?.category,
                            items: [],
                          })
                        }
                      />
                      <FormErrorMessage message={itemError?.url} />
                    </FormInputWrapper>
                    <FormInputWrapper>
                      <Label htmlFor="categoryId">
                        Category linked <small>(optional)</small>
                      </Label>
                      <Select
                        name="categoryId"
                        onValueChange={(value) => {
                          setCurrentItem({
                            id: currentItem?.id ?? crypto.randomUUID(),
                            name: currentItem?.name ?? '',
                            url: currentItem?.url ?? '',
                            items: [],
                            category: categories.find(
                              (category) => category.id === value
                            ),
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              categories.find(
                                (cat) => cat.id === currentItem?.category?.id
                              )?.name
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormInputWrapper>
                  </div>
                  <SheetFooter>
                    <Button onClick={handleSaveItem}>Save changes</Button>
                    <SheetClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </CardFooter>
          </Card>
        </div>
        <div className="col-span-1 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Details</CardTitle>
              <CardDescription>
                Fill in the details of the navigation
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <FormInputWrapper>
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Main Navigation"
                  defaultValue={navigation?.name}
                />
                <FormErrorMessage message={error?.name} />
              </FormInputWrapper>
              <FormInputWrapper>
                <Label htmlFor="handle">Slug</Label>
                <Input
                  type="text"
                  id="slug"
                  name="slug"
                  placeholder="main-navigation"
                  defaultValue={navigation?.name}
                />
                <FormErrorMessage message={error?.name} />
              </FormInputWrapper>
            </CardContent>
          </Card>
        </div>
      </div>

      <SubmitButton />
    </Form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="mt-4">
      {pending ? 'Saving...' : 'Submit'}
    </Button>
  );
}
