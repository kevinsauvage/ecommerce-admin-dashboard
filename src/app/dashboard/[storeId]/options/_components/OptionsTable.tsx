/* eslint-disable react-perf/jsx-no-new-array-as-prop */
'use client';

import { Option, OptionValue } from '@prisma/client';
import { Copy, Edit, MoreVerticalIcon, Trash } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { deleteOption } from '@/actions/optionActions';
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

export default function OptionsTable({
  options = [],
}: {
  options: Array<
    Option & {
      values: Array<OptionValue>;
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
      const response = await deleteOption(
        idToDelete as string,
        storeId as string
      );

      if (response?.error) {
        toast({
          variant: 'destructive',
          title: 'Oops! Something went wrong',
          description: response.message,
        });
        return;
      }

      setIdToDelete('');
      toast({
        variant: 'default',
        title: 'Success',
        description: 'The option has been deleted',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Oops! Something went wrong',
        description: 'Error while trying to delete the option',
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
            <TableHead>Name</TableHead>
            <TableHead>Values</TableHead>
            <TableHead className="hidden md:table-cell">Created At</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {options.map((option) => (
            <TableRow key={option.id}>
              <TableCell>{option.name}</TableCell>
              <TableCell>
                {option.values.map((value) => value.name).join(', ')}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Date date={option.createdAt} />
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
                        navigator.clipboard.writeText(option.id);
                        toast({ description: 'ID copied to clipboard' });
                      }}
                    >
                      <Copy size={16} className="mr-2" />
                      Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/${option.storeId}/options/${option.id}/edit`}
                      >
                        <Edit size={16} className="mr-2" />
                        Update
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIdToDelete(option.id)}>
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
