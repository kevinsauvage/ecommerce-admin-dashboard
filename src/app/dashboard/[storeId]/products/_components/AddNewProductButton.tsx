import { Plus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function AddNewProductButton({ storeId }: { storeId: string }) {
  return (
    <Button variant="default" asChild>
      <Link
        href={`/dashboard/${storeId}/products/new`}
        className="flex flex-row items-center justify-center gap-2"
      >
        <Plus size={16} />
        Add New
      </Link>
    </Button>
  );
}
