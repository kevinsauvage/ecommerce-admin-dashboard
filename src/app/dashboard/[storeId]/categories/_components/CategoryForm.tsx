'use client';

import { Category } from '@prisma/client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { addCategory, updateCategory } from '@/actions/categoriesActions';
import Form from '@/components/Form';
import FormErrorMessage from '@/components/FormErrorMessage';
import FormInputWrapper from '@/components/FormInputWrapper';
import ImageUpload from '@/components/ImageUpload';
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
  [key: string]: string | string[] | undefined;
}

export default function CategoryForm({ category }: { category?: Category }) {
  const [categoryImage, setCategoryImage] = useState<string | null | undefined>(
    category?.imageURL
  );
  const { storeId } = useParams() as { storeId: string };
  const { toast } = useToast();

  const [error, action] = useFormState<Action, FormData>(
    category ? updateCategory : addCategory,
    {}
  );

  useEffect(() => {
    if (error?.message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  }, [error, toast]);

  return (
    <Form action={action}>
      <input type="hidden" name="storeId" value={storeId} />
      <input type="hidden" name="categoryId" value={category?.id} />
      <input type="hidden" name="imageURL" value={category?.imageURL || ''} />
      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
            <CardDescription>
              Fill in the details of the category
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <FormInputWrapper>
              <Label htmlFor="label">Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                placeholder="Category name"
                defaultValue={category?.name}
              />
              <FormErrorMessage message={error?.name} />
            </FormInputWrapper>
            <FormInputWrapper>
              <Label htmlFor="description">Description</Label>
              <Input
                type="text"
                id="description"
                name="description"
                placeholder="Category description"
                defaultValue={category?.description}
              />
            </FormInputWrapper>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Category Image</CardTitle>
            <CardDescription>Upload an image for the category</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value={categoryImage ? [categoryImage] : []}
              onChange={(url) => setCategoryImage(url)}
              onRemove={() => setCategoryImage(undefined)}
            />
          </CardContent>
        </Card>
      </div>
      <SubmitButton />
    </Form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="mt-6">
      {pending ? 'Saving...' : 'Submit'}
    </Button>
  );
}
