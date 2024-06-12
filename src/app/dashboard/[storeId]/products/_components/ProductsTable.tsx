'use client';

import { Category } from '@prisma/client';
import { MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { deleteProduct } from '@/actions/productActions';
import AlertModal from '@/components/AlertModal';
import Date from '@/components/Date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { formatCurrency } from '@/lib/formatters';
import { ProductWithRelation } from '@/types';

export default function ProductsTable({
  products = [],
}: {
  products: Array<ProductWithRelation>;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [idToDelete, setIdToDelete] = useState<string>('');
  const { storeId } = useParams();

  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await deleteProduct(
        idToDelete as string,
        storeId as string
      );

      if (response?.error) {
        toast({
          variant: 'destructive',
          title: 'Error:',
          description: response.message,
        });
        return;
      }

      setIdToDelete('');
      toast({
        variant: 'default',
        title: 'Success',
        description: 'The product has been deleted',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Oops! Something went wrong',
        description: 'Error while trying to delete the product',
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
            <TableHead className="hidden w-[100px] sm:table-cell">
              <span className="sr-only">Image</span>
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Categories</TableHead>
            <TableHead className="hidden md:table-cell">Price</TableHead>
            <TableHead className="hidden md:table-cell">Stock</TableHead>
            <TableHead className="hidden md:table-cell">Created at</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell key={product.id} className="hidden sm:table-cell">
                <Image
                  alt="Product image"
                  className="aspect-square rounded-md object-cover"
                  height={64}
                  src={product.images[0]?.url ?? '/images/placeholder.svg'}
                  width={64}
                />
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-2 w-fit">
                  <Badge variant="outline" className="w-fit">
                    {product.isArchived ? 'Archived' : 'Active'}
                  </Badge>
                  {product.isFeatured && (
                    <Badge variant="outline" className="w-fit">
                      Featured
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex gap-1 flex-wrap">
                  {product.categories?.map((category: Category) => (
                    <Badge key={category.id} className="w-fit">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {formatCurrency(Number(product.price))}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {product.stock}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Date date={product.createdAt} />
              </TableCell>
              <TableCell className="text-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Link
                        href={`/dashboard/${storeId}/products/${product.id}/edit`}
                      >
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIdToDelete(product.id)}>
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
