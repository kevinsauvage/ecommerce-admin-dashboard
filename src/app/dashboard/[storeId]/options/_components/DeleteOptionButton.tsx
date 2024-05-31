'use client';

import { Trash } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { deleteOption } from '@/actions/optionActions';
import AlertModal from '@/components/AlertModal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function DeleteOptionButton() {
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const { storeId, optionId } = useParams();

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteOption(optionId as string, storeId as string);
      toast({
        variant: 'default',
        title: 'Success',
        description: 'The option has been deleted',
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error while trying to delete the option';

      toast({
        variant: 'destructive',
        title: 'Oops! Something went wrong',
        description: errorMessage,
      });
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
        <span className="sr-only">Delete option</span>
      </Button>
    </>
  );
}
