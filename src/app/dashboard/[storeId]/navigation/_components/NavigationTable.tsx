/* eslint-disable react-perf/jsx-no-new-array-as-prop */
'use client';

import { Navigation } from '@prisma/client';
import { Copy, Edit, MoreVerticalIcon, Trash } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { deleteNavigation } from '@/actions/navigationActions';
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

export default function NavigationTable({
  navigation = [],
}: {
  navigation: Array<Navigation>;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [idToDelete, setIdToDelete] = useState<string>('');
  const { storeId } = useParams();

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteNavigation(idToDelete as string, storeId as string);
      setIdToDelete('');
      toast({
        variant: 'default',
        title: 'Success',
        description: 'The navigation has been deleted',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Oops! Something went wrong',
        description: 'Error while trying to delete the navigation',
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
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">Slug</TableHead>
            <TableHead className="hidden md:table-cell">Created At</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {navigation.map((menu) => (
            <TableRow key={menu.id}>
              <TableCell>{menu.name}</TableCell>
              <TableCell>{menu.slug}</TableCell>
              <TableCell className="hidden md:table-cell">
                <Date date={menu.createdAt} />
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
                        navigator.clipboard.writeText(menu.id);
                        toast({ description: 'ID copied to clipboard' });
                      }}
                    >
                      <Copy size={16} className="mr-2" />
                      Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/${storeId}/navigation/${menu.id}/edit`}
                      >
                        <Edit size={16} className="mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIdToDelete(menu.id)}>
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
