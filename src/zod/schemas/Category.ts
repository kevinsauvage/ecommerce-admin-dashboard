import { z } from 'zod';

export const CategorySchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().optional(),
  imageURL: z.string().optional(),
});
