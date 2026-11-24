import { z } from 'zod';

// Unknown filter values are ignored (shown as "all").
export const galleryQuerySchema = {
  query: z.object({
    slot: z.string().max(20).optional(),
    sort: z.string().max(20).optional(),
    q: z.string().trim().max(50).optional(),
  }),
};
