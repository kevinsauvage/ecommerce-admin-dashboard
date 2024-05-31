/* eslint-disable react-perf/jsx-no-new-array-as-prop */
'use client';

import { Category } from '@prisma/client';
import { Copy, Edit, MoreVerticalIcon, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { deleteCategory } from '@/actions/categoriesActions';
import AlertModal from '@/components/AlertModal';
import Date from '@/components/Date';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';

export default function CategoriesTable({
  categories = [],
}: {
  categories: Array<
    Category & {
      childCategories?: Array<
        Category & {
          childCategories: Array<
            Category & {
              childCategories: Array<Category>;
            }
          >;
        }
      >;
    }
  >;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [idToDelete, setIdToDelete] = useState<string>('');
  const { storeId } = useParams();

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteCategory(idToDelete as string, storeId as string);
      setIdToDelete('');
      toast({
        variant: 'default',
        title: 'Success',
        description: 'The category has been deleted',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Oops! Something went wrong',
        description: 'Error while trying to delete the category',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={idToDelete !== ''}
        close={() => setIdToDelete('')}
        onConfirm={() => handleDelete()}
        loading={loading}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden sm:table-cell">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Child</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-end">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="hidden sm:table-cell">
                <Image
                  alt="Category image"
                  className="aspect-square rounded-md object-cover"
                  height={64}
                  src={category.imageURL || '/images/placeholder.svg'}
                  width={64}
                />
              </TableCell>
              <TableCell>
                {category?.childCategories &&
                category?.childCategories?.length > 0 ? (
                  <Link
                    href={`/dashboard/${storeId}/categories/${category.id}`}
                    className="text-blue-600 dark:text-blue-400"
                  >
                    {category.name}
                  </Link>
                ) : (
                  category.name
                )}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {category.childCategories?.length}
              </TableCell>
              <TableCell>
                <Date date={category.createdAt} />
              </TableCell>
              <TableCell className="text-end">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVerticalIcon />
                    <span className="sr-only">Actions</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        navigator.clipboard.writeText(category.id);
                        toast({ description: 'ID copied to clipboard' });
                      }}
                    >
                      <Copy size={16} className="mr-2" />
                      Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/${category.storeId}/categories/${category.id}/edit`}
                      >
                        <Edit size={16} className="mr-2" />
                        Update
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIdToDelete(category.id)}
                    >
                      <Trash size={16} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
