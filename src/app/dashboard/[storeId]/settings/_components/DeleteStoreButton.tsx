'use client';

import { Trash } from 'lucide-react';
import { useState } from 'react';

import { deleteStore } from '@/actions/storeActions';
import AlertModal from '@/components/AlertModal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function DeleteStoreButton({ storeId }: { storeId: string }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteStore(storeId);
      toast({
        variant: 'default',
        title: 'Success',
        description: 'The store has been deleted',
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          variant: 'destructive',
          title: 'Oops! Something went wrong',
          description:
            error?.message || 'Error while trying to delete the store',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={isOpen}
        close={() => setIsOpen(false)}
        onConfirm={handleDelete}
        loading={loading}
      />

      <Button
        disabled={loading}
        variant="destructive"
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <Trash size={20} className="" />
        <span className="sr-only">Delete store</span>
      </Button>
    </>
  );
}
