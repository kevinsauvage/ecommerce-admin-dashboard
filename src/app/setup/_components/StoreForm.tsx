'use client';

import { useFormState, useFormStatus } from 'react-dom';

import { addStore } from '@/actions/storeActions';
import FormErrorMessage from '@/components/FormErrorMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function StoreForm() {
  const [error, action] = useFormState<
    {
      name?: string | Array<string> | undefined;
      error?: string;
    },
    FormData
  >(addStore, {});

  return (
    <Card>
      <CardContent>
        <form action={action}>
          <div className="space-y-2 mb-4 mt-4">
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Store name"
              className="max-w-96 w-full"
            />
            <FormErrorMessage message={error?.name || error.error} />
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Submit'}
    </Button>
  );
}
