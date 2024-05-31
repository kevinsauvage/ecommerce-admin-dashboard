import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NoProducts({ storeId }: { storeId: string }) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full">
      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-2xl font-bold tracking-tight">
          You have no products
        </h3>
        <p className="text-sm text-muted-foreground">
          You can start selling as soon as you add a product.
        </p>
        <Button className="mt-4" asChild>
          <Link href={`/dashboard/${storeId}/products/new`}>Add a product</Link>
        </Button>
      </div>
    </div>
  );
}
