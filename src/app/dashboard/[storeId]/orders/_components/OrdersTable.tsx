/* eslint-disable react-perf/jsx-no-new-array-as-prop */
'use client';

import { Order } from '@prisma/client';
import { Copy, MoreVerticalIcon } from 'lucide-react';

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

export default function OrdersTable({ orders = [] }: { orders: Array<Order> }) {
  const { toast } = useToast();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Paid</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Total Price</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.isPaid}</TableCell>
            <TableCell>{order.phone}</TableCell>
            <TableCell>{order.address}</TableCell>
            <TableCell>{Number(order.totalPrice)}</TableCell>
            <TableCell>
              <Date date={order.createdAt} />
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVerticalIcon />
                  <span className="sr-only">Actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(order.id);
                      toast({
                        description: 'ID copied to clipboard',
                      });
                    }}
                  >
                    <Copy size={16} className="mr-2" />
                    Copy ID
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
