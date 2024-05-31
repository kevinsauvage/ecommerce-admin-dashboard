/* eslint-disable react-perf/jsx-no-new-array-as-prop */
'use client';

import { Option, OptionValue } from '@prisma/client';
import { LucideX } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { addOption, updateOption } from '@/actions/optionActions';
import Form from '@/components/Form';
import FormErrorMessage from '@/components/FormErrorMessage';
import FormInputWrapper from '@/components/FormInputWrapper';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface Action {
  name?: string[];
  values?: string[];
  error?: string;
}

export default function OptionForm({
  option,
}: {
  option?: Option & {
    values: OptionValue[];
  };
}) {
  const [values, setValues] = useState<string[]>(
    option?.values.map((v) => v.name) || []
  );
  const { storeId } = useParams() as { storeId: string };
  const { toast } = useToast();

  const [error, action] = useFormState<Action, FormData>(
    option
      ? updateOption.bind(null, storeId, values, option.id)
      : addOption.bind(null, storeId, values),
    {}
  );

  useEffect(() => {
    if (error?.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.error,
      });
    }
  }, [error, toast]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const value = event.currentTarget.value.trim();
      if (value && !values.includes(value)) {
        setValues((prev) => [...prev, value]);
        event.currentTarget.value = '';
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    setValues(values.filter((t) => t !== tag));
  };

  return (
    <Form action={action}>
      <Card>
        <CardHeader>
          <CardTitle>Option Details</CardTitle>
          <CardDescription>Fill in the details of the option</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <FormInputWrapper>
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              placeholder="Option name"
              defaultValue={option?.name}
            />
            <FormErrorMessage message={error?.name} />
          </FormInputWrapper>
          <FormInputWrapper>
            <Label htmlFor="values">Values</Label>
            <Input
              type="text"
              id="values"
              placeholder="Enter a value and press Enter"
              onKeyDown={handleKeyDown}
            />
            {values.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4">
                {values.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-card-foreground text-card space-x-2 rounded py-1 px-2 text-sm"
                  >
                    <p>{tag}</p>
                    <button
                      type="button"
                      className="text-red-500"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <LucideX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <FormErrorMessage message={error?.values} />
          </FormInputWrapper>
        </CardContent>
      </Card>
      <SubmitButton />
    </Form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="mt-4">
      {pending ? 'Saving...' : 'Submit'}
    </Button>
  );
}
