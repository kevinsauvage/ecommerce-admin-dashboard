'use client';

import {
  Category,
  Image,
  Option,
  OptionValue,
  Product,
  Tag,
  Variant,
  VariantOptionValue,
} from '@prisma/client';
import { LucideX, PlusCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import VariantTable from './VariantTable';
import { addProduct, updateProduct } from '@/actions/productActions';
import Form from '@/components/Form';
import FormErrorMessage from '@/components/FormErrorMessage';
import FormInputWrapper from '@/components/FormInputWrapper';
import ImageUpload from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { useToast } from '@/components/ui/use-toast';

const buildVariantsOptions = (
  variants: Array<
    Variant & {
      options: Array<VariantOptionValue>;
    }
  >
) => {
  const result = variants?.map((variant) => {
    return {
      stock: variant.stock.toString(),
      options: variant.options.map((option) => {
        return {
          optionId: option.optionId,
          valueId: option.optionValueId,
        };
      }),
    };
  });
  return result || [];
};

interface ActionResponse {
  error?: string;
  [key: string]: string | Array<string> | undefined;
}

interface MediaSelectionProps {
  error?: ActionResponse;
  productImages: Array<{ url: string }>;
  onChange: (url: string) => void;
  onRemove: (url: string) => void;
}

function MediaSelection({
  onChange,
  onRemove,
  error,
  productImages,
}: MediaSelectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Media</CardTitle>
        <CardDescription>
          Add images to your product.{' '}
          <span className="text-accent-foreground">
            {productImages.length} images uploaded
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Label htmlFor="images" className="sr-only">
          Images
        </Label>
        <ImageUpload
          onChange={onChange}
          onRemove={onRemove}
          value={productImages.map((image) => image.url)}
        />
        <FormErrorMessage message={error?.images} />
      </CardContent>
    </Card>
  );
}

export interface VariantInput {
  stock: string;
  options: Array<{
    optionId: string;
    valueId: string;
  }>;
}

function VariantSelection({
  variants,
  onChange,
  options,
  error,
}: {
  variants: Array<VariantInput>;
  onChange: (variants: Array<VariantInput>) => void;
  options: Array<
    Option & {
      values: Array<OptionValue>;
    }
  >;
  error: ActionResponse;
}) {
  const [selectedOptions, setSelectedOptions] = useState(
    variants.length
      ? options.filter((option) =>
          variants.find((variant) =>
            variant.options.find((opt) => opt.optionId === option.id)
          )
        )
      : options
  );

  const onCheckedChange = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    option: Option & { values: Array<OptionValue> }
  ) => {
    e.preventDefault();
    setSelectedOptions((prev) => {
      const newOptions = [...prev];
      const index = newOptions.findIndex((opt) => opt.id === option.id);
      if (index === -1) {
        newOptions.push(option);
      } else {
        newOptions.splice(index, 1);
        onChange(
          variants.map((variant) => {
            return {
              stock: variant.stock,
              options: variant.options.filter(
                (opt) => opt.optionId !== option.id
              ),
            };
          })
        );
      }
      return newOptions;
    });
  };

  const addVariant = () => onChange([...variants, { options: [], stock: '0' }]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variants</CardTitle>
        <CardDescription>
          Add variants to your product.{' '}
          <span className="text-accent-foreground">
            {selectedOptions.length} option selected
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex gap-2 flex-wrap mb-4">
          {options.map((option) => (
            <Toggle
              variant="outline"
              key={option.id}
              aria-label={`Toggle ${option.name}`}
              onClick={(e) => onCheckedChange(e, option)}
              pressed={selectedOptions.some((opt) => opt.id === option.id)}
              defaultPressed={selectedOptions.some(
                (opt) => opt.id === option.id
              )}
            >
              {option.name}
            </Toggle>
          ))}
        </div>
        <div>
          {variants.length > 0 && (
            <VariantTable
              variants={variants}
              selectedOptions={selectedOptions}
              onStockChange={(index, stock) => {
                const newVariants = [...variants];
                newVariants[index].stock = stock;
                onChange(newVariants);
              }}
              onDelete={(index) => {
                onChange(variants.filter((_, i) => i !== index));
              }}
              handleVariantChange={(index, optionId, valueId) => {
                const newVariants = [...variants];
                const variant = newVariants[index];
                const option = variant.options.find(
                  (opt) => opt.optionId === optionId
                );
                if (option) option.valueId = valueId;
                else variant.options.push({ optionId, valueId });
                onChange(newVariants);
              }}
            />
          )}
        </div>
        <FormErrorMessage message={error?.variants?.[0]} />
      </CardContent>
      <CardFooter className="justify-center border-t p-4">
        <Button
          onClick={addVariant}
          type="button"
          variant="ghost"
          className="flex gap-2"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Variants
        </Button>
      </CardFooter>
    </Card>
  );
}

function ProductInformationSelection({
  product,
  error,
}: {
  product?: Product;
  error?: ActionResponse;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product information</CardTitle>
        <CardDescription>
          Add basic information about your product.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <FormInputWrapper>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            placeholder="Product name"
            defaultValue={product?.name}
          />
          <FormErrorMessage message={error?.name} />
        </FormInputWrapper>
        <FormInputWrapper>
          <Label htmlFor="slug">Slug</Label>
          <Input
            type="text"
            id="slug"
            name="slug"
            placeholder="product-slug"
            defaultValue={product?.slug}
          />
          <FormErrorMessage message={error?.slug} />
        </FormInputWrapper>
        <FormInputWrapper>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Product description"
            defaultValue={product?.description}
            className="min-h-48"
          />
          <FormErrorMessage message={error?.description} />
        </FormInputWrapper>
      </CardContent>
    </Card>
  );
}

function SEOSelection({
  product,
  error,
}: {
  product?: Product;
  error: ActionResponse;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO</CardTitle>
        <CardDescription>
          Add SEO information to improve your product visibility.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <FormInputWrapper>
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input
            type="text"
            id="metaTitle"
            name="metaTitle"
            placeholder="Meta title"
            defaultValue={product?.metaTitle}
          />
          <FormErrorMessage message={error?.metaTitle} />
        </FormInputWrapper>
        <FormInputWrapper>
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Input
            type="text"
            id="metaDescription"
            name="metaDescription"
            placeholder="Meta description"
            defaultValue={product?.metaDescription}
          />
          <FormErrorMessage message={error?.metaDescription} />
        </FormInputWrapper>
        <FormInputWrapper>
          <Label htmlFor="metaKeywords">Meta Keywords</Label>
          <Input
            type="text"
            id="metaKeywords"
            name="metaKeywords"
            placeholder="Shirt, T-shirt, Cotton, Summer, Fashion"
            defaultValue={product?.metaKeywords}
          />
          <FormErrorMessage message={error?.metaKeywords} />
        </FormInputWrapper>
      </CardContent>
    </Card>
  );
}

function PriceSelection({
  product,
  error,
}: {
  product?: Product;
  error: ActionResponse;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Price</CardTitle>
        <CardDescription>
          Add pricing information for your product.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <FormInputWrapper>
          <Label htmlFor="price">Regular Price</Label>
          <Input
            type="number"
            step=".01"
            id="price"
            name="price"
            required
            placeholder="Product price"
            defaultValue={Number(product?.price || 0)}
          />
          <FormErrorMessage message={error?.price} />
        </FormInputWrapper>
        <FormInputWrapper>
          <Label htmlFor="salePrice">Sale Price</Label>
          <Input
            type="number"
            step=".01"
            id="salePrice"
            name="salePrice"
            required
            placeholder="Product sale price"
            defaultValue={Number(product?.salePrice || 0)}
          />
          <FormErrorMessage message={error?.salePrice} />
        </FormInputWrapper>
        <FormInputWrapper>
          <Label htmlFor="shippingPrice">Shipping Price</Label>
          <Input
            type="number"
            step=".01"
            id="shippingPrice"
            name="shippingPrice"
            required
            placeholder="Product shipping price"
            defaultValue={Number(product?.shippingPrice || 0)}
          />
          <FormErrorMessage message={error?.shippingPrice} />
        </FormInputWrapper>
      </CardContent>
    </Card>
  );
}

function InventorySelection({
  product,
  error,
  variants,
}: {
  product?: Product;
  error: ActionResponse;
  variants: Array<VariantInput>;
}) {
  const variantsStock = variants.reduce(
    (acc, variant) => acc + Number(variant.stock || 0),
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory</CardTitle>
        <CardDescription>
          Add inventory information for your product.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <FormInputWrapper>
          <Label htmlFor="stock" className="sr-only">
            Stock
          </Label>
          <Input
            type="number"
            id="stock"
            min={0}
            name="stock"
            placeholder="Stock"
            value={variants.length ? variantsStock : undefined}
            disabled={variants.length > 0}
            defaultValue={Number(product?.stock || variantsStock || 0)}
          />
          <FormErrorMessage message={error?.stock} />
        </FormInputWrapper>
      </CardContent>
    </Card>
  );
}

function CategorySelection({
  categories,
  product,
  error,
}: {
  categories: Array<Category>;
  product?: Product;
  error: ActionResponse;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category</CardTitle>
        <CardDescription>Add a category to your product.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <FormInputWrapper>
          <Label htmlFor="categoryId" className="sr-only">
            Category
          </Label>
          <Select name="categoryId" defaultValue={product?.categoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormErrorMessage message={error?.categoryId} />
        </FormInputWrapper>
      </CardContent>
    </Card>
  );
}

function TagsSelection({
  tags,
  error,
  onChange,
}: {
  tags: Array<string>;
  error: ActionResponse;
  onChange: (tags: Array<string>) => void;
}) {
  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const value = event.currentTarget.value.trim();
      if (value && !tags.includes(value)) {
        onChange([...tags, value]);
        event.currentTarget.value = '';
      }
    }
  };

  const handleRemoveTag = (tag: string) =>
    onChange(tags.filter((t) => t !== tag));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
        <CardDescription>Add tags to your product.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <FormInputWrapper>
          <Label htmlFor="tags" className="sr-only">
            Tags
          </Label>
          <Input
            type="text"
            id="tags"
            placeholder="Enter a tag and press Enter"
            onKeyDown={handleTagKeyDown}
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {tags.map((tag, index) => (
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
          <FormErrorMessage message={error?.tags} />
        </FormInputWrapper>
      </CardContent>
    </Card>
  );
}

function VisibilitySelection({
  product,
  error,
}: {
  product?: Product;
  error: ActionResponse;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visibility</CardTitle>
        <CardDescription>Set the visibility of your product.</CardDescription>
      </CardHeader>
      <CardContent>
        <FormInputWrapper className="flex gap-2 space-y-0 mb-4">
          <Checkbox
            id="isFeatured"
            name="isFeatured"
            defaultChecked={product?.isFeatured}
          />
          <label
            htmlFor="isFeatured"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            <span className="block">Featured</span>
            <span className="block text-xs text-gray-500">
              This product will appear on the home page.
            </span>
          </label>
          <FormErrorMessage message={error?.isFeatured} />
        </FormInputWrapper>
        <FormInputWrapper className="flex gap-2 space-y-0">
          <Checkbox
            id="isArchived"
            name="isArchived"
            defaultChecked={product?.isArchived}
          />
          <label
            htmlFor="isArchived"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            <span className="block">Archived</span>
            <span className="block text-xs text-gray-500">
              This product will not appear anywhere in the store.
            </span>
          </label>
          <FormErrorMessage message={error?.isArchived} />
        </FormInputWrapper>
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

export default function ProductForm({
  product,
  categories,
  options,
}: {
  product?: Product & {
    images: Array<Image>;
    variants: Array<
      Variant & {
        options: Array<VariantOptionValue>;
      }
    >;
    tags: Array<Tag>;
  };
  categories: Array<Category>;
  options: Array<
    Option & {
      values: Array<OptionValue>;
    }
  >;
}) {
  const [productImages, setProductImages] = useState<Array<{ url: string }>>(
    product?.images || []
  );
  const [tags, setTags] = useState(product?.tags.map((tag) => tag.name) || []);
  const [variants, setVariants] = useState<Array<VariantInput>>(
    buildVariantsOptions(product?.variants || [])
  );
  const { toast } = useToast();
  const { storeId } = useParams() as { storeId: string };

  const [error, action] = useFormState<ActionResponse, FormData>(
    product
      ? updateProduct.bind(
          null,
          storeId,
          product.id,
          productImages,
          tags,
          variants
        )
      : addProduct.bind(null, storeId, productImages, tags, variants),
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

  return (
    <Form action={action}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="col-span-2 flex flex-col gap-8">
          <ProductInformationSelection product={product} error={error} />
          <MediaSelection
            onChange={(url) => setProductImages((prev) => [...prev, { url }])}
            onRemove={(url) =>
              setProductImages((prev) =>
                prev.filter((item) => item.url !== url)
              )
            }
            error={error}
            productImages={productImages}
          />
          <SEOSelection product={product} error={error} />
          <VariantSelection
            variants={variants}
            onChange={setVariants}
            options={options}
            error={error}
          />
        </div>
        <div className="col-span-1 flex flex-col gap-8">
          <PriceSelection product={product} error={error} />
          <InventorySelection
            product={product}
            error={error}
            variants={variants}
          />
          <CategorySelection
            categories={categories}
            error={error}
            product={product}
          />
          <TagsSelection tags={tags} error={error} onChange={setTags} />
          <VisibilitySelection product={product} error={error} />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <SubmitButton />
      </div>
    </Form>
  );
}
