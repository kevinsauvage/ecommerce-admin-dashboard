/* eslint-disable react-perf/jsx-no-new-array-as-prop */
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { CategoryTypeWithRelations } from '@/types';

const categorySelectRecursive = (
  categories: Array<CategoryTypeWithRelations>,
  categoryId?: string | null
) => {
  return categories.map((category) => {
    if (category.childCategories.length > 0) {
      return (
        <>
          <SelectItem
            key={category.id}
            value={category.id}
            disabled={category.id === categoryId}
          >
            {category.name}
          </SelectItem>
          <SelectGroup className="ml-6">
            {categorySelectRecursive(
              category.childCategories as Array<CategoryTypeWithRelations>,
              categoryId
            )}
          </SelectGroup>
        </>
      );
    } else {
      return (
        <SelectItem
          key={category.id}
          value={category.id}
          disabled={category.id === categoryId}
        >
          {category.name}
        </SelectItem>
      );
    }
  });
};

interface Action {
  name?: string[];
  description?: string[];
  imageURL?: string[];
  parentId?: string[];
  message?: string;
}

export default function CategoryForm({
  category,
  categories,
}: {
  category?: Category;
  categories: Array<CategoryTypeWithRelations>;
}) {
  const [categoryImage, setCategoryImage] = useState<string | null | undefined>(
    category?.imageURL
  );
  const { storeId } = useParams() as { storeId: string };
  const { toast } = useToast();

  const actionFn = category
    ? updateCategory.bind(null, storeId, category.id, categoryImage)
    : addCategory.bind(null, storeId, categoryImage);

  const [error, action] = useFormState<Action, FormData>(actionFn, {});

  useEffect(() => {
    console.log('🟩🟪🟦-->  ~ error:', error);
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
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="col-span-2 flex flex-col gap-8">
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
              <CardDescription>
                Upload an image for the category
              </CardDescription>
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
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Parent Category</CardTitle>
              <CardDescription>Select the parent category</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Select name="parentId">
                <SelectTrigger>
                  <SelectValue placeholder="Parent category" />
                </SelectTrigger>
                <SelectContent>
                  {categorySelectRecursive(categories, category?.id)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
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
