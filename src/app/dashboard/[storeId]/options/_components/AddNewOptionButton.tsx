import { Plus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function AddNewOptionButton({ storeId }: { storeId: string }) {
  return (
    <Button asChild variant="default">
      <Link
        href={`/dashboard/${storeId}/options/new`}
        className="flex flex-row items-center justify-center gap-2"
      >
        <Plus size={16} />
        Add New
      </Link>
    </Button>
  );
}
