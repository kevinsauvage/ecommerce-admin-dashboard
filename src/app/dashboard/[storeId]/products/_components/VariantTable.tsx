import { Option, OptionValue } from '@prisma/client';
import { Trash } from 'lucide-react';

import { VariantInput } from './ProductForm';
import { Button } from '@/components/ui/button';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function VariantTable2({
  variants = [],
  selectedOptions = [],
  onStockChange,
  onDelete,
  handleVariantChange,
}: {
  variants: Array<VariantInput>;
  selectedOptions: Array<
    Option & {
      values: Array<OptionValue>;
    }
  >;
  onStockChange: (index: number, stock: string) => void;
  onDelete: (id: number) => void;
  handleVariantChange: (
    index: number,
    optionId: string,
    valueId: string
  ) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Stock</TableHead>
          {selectedOptions.map((option, index) => (
            <TableHead key={index}>{option.name}</TableHead>
          ))}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {variants.map((variant, index) => (
          <TableRow key={index}>
            <TableCell>
              <Label htmlFor="stock" className="sr-only">
                Stock
              </Label>
              <Input
                id="stock"
                type="number"
                min={0}
                value={variant.stock}
                onChange={(e) => onStockChange(index, e.target.value)}
                disabled={!selectedOptions.length}
              />
            </TableCell>
            {selectedOptions.map((option) => (
              <TableCell key={option.id}>
                <Select
                  defaultValue={
                    variant.options.find((o) => o.optionId === option.id)
                      ?.valueId
                  }
                  onValueChange={(value) =>
                    handleVariantChange(index, option.id, value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={option.name} />
                  </SelectTrigger>
                  <SelectContent>
                    {option.values.map((value) => (
                      <SelectItem key={value.id} value={value.id}>
                        {value.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            ))}
            <TableCell className="text-right">
              <Button
                onClick={() => onDelete(index)}
                size="icon"
                variant="destructive"
              >
                <Trash size={16} />
                <span className="sr-only">Delete</span>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
