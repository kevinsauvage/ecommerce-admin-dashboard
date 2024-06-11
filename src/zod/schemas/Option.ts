import { z } from 'zod';

export const optionSchema = z.object({
  name: z.string().min(1, { message: 'Please enter a name' }),
  values: z
    .string()
    .transform((value) => (value?.trim() ? value.split(',').map(String) : []))
    .pipe(
      z
        .string()
        .array()
        .nonempty({ message: 'Please enter at least one value' })
    ),
});
