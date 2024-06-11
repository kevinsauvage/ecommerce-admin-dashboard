'use client';

import { Store } from '@prisma/client';
import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { updateStore } from '@/actions/storeActions';
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

type ReturnType = {
  success?: boolean;
  error?: boolean;
  message?: string;
  logo?: string | Array<string> | undefined;
  name?: string | Array<string> | undefined;
  description?: string | Array<string> | undefined;
  address?: string | Array<string> | undefined;
  phone?: string | Array<string> | undefined;
  email?: string | Array<string> | undefined;
  facebook?: string | Array<string> | undefined;
  instagram?: string | Array<string> | undefined;
  twitter?: string | Array<string> | undefined;
};

export default function StoreSettingsForm({ store }: { store: Store }) {
  const [logo, setLogo] = useState(store?.logo ? [store.logo] : []);
  const { toast } = useToast();

  const [state, action] = useFormState<ReturnType, FormData>(updateStore, {});

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    } else if (state?.success) {
      toast({
        variant: 'success',
        title: 'Success',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <Form action={action}>
      <input type="hidden" name="storeId" value={store.id} />
      <input type="hidden" name="logo" value={logo[0]} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="col-span-2 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Store details</CardTitle>
              <CardDescription>
                Fill in the details of the store
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <FormInputWrapper>
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Color name"
                  defaultValue={store?.name}
                />
                <FormErrorMessage message={state?.name} />
              </FormInputWrapper>

              <FormInputWrapper>
                <Label htmlFor="description">Description</Label>
                <Input
                  type="text"
                  id="description"
                  name="description"
                  placeholder="Store description"
                  defaultValue={store?.description}
                />
                <FormErrorMessage message={state?.description} />
              </FormInputWrapper>

              <FormInputWrapper>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Store email"
                  defaultValue={store?.email}
                />
                <FormErrorMessage message={state?.email} />
              </FormInputWrapper>

              <FormInputWrapper>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  type="text"
                  id="phone"
                  name="phone"
                  placeholder="Store phone"
                  defaultValue={store?.phone}
                />
                <FormErrorMessage message={state?.phone} />
              </FormInputWrapper>

              <FormInputWrapper>
                <Label htmlFor="address">Address</Label>
                <Input
                  type="text"
                  id="address"
                  name="address"
                  placeholder="Store address"
                  defaultValue={store?.address}
                />
                <FormErrorMessage message={state?.address} />
              </FormInputWrapper>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-1 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Social media</CardTitle>
              <CardDescription>
                Fill in the social media details of the store
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <FormInputWrapper>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  type="text"
                  id="facebook"
                  name="facebook"
                  placeholder="Store facebook"
                  defaultValue={store?.facebook}
                />
                <FormErrorMessage message={state?.facebook} />
              </FormInputWrapper>
              <FormInputWrapper>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  type="text"
                  id="instagram"
                  name="instagram"
                  placeholder="Store instagram"
                  defaultValue={store?.instagram}
                />
                <FormErrorMessage message={state?.instagram} />
              </FormInputWrapper>
              <FormInputWrapper>
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  type="text"
                  id="twitter"
                  name="twitter"
                  placeholder="Store twitter"
                  defaultValue={store?.twitter}
                />
                <FormErrorMessage message={state?.twitter} />
              </FormInputWrapper>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>Upload a logo for the store</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Label htmlFor="logo">Logo</Label>
              <ImageUpload
                onChange={(url) => setLogo([url])}
                value={logo}
                onRemove={() => setLogo([])}
                imageClassName="object-contain"
              />
              <FormErrorMessage message={state?.logo} />
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
    <Button type="submit" disabled={pending} className="mt-4">
      {pending ? 'Saving...' : 'Submit'}
    </Button>
  );
}
