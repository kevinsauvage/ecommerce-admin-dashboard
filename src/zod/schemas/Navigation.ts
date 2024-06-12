import { z } from 'zod';

type ZodNavigationItem = {
  name: string;
  url: string;
  items: ZodNavigationItem[];
};

const navigationItemSchema: z.ZodSchema<ZodNavigationItem> = z.lazy(() =>
  z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    url: z.string().min(1, { message: 'URL is required' }),
    category: z.object({ id: z.string() }).optional(),
    items: z.array(z.lazy(() => navigationItemSchema)),
  })
);

export const NavigationArraySchema = z.array(navigationItemSchema);

export const NavigationSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  slug: z
    .string()
    .min(1, { message: 'Slug is required' })
    .regex(/^[a-zA-Z]+(-[a-zA-Z]+)*$/, {
      message: 'Slug is in a wrong format',
    }),
});
