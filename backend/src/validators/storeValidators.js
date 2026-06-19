const { z } = require('zod');

const storeListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional().default(''),
  sortBy: z.enum(['name', 'address', 'overall_rating', 'created_at']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

const ratingSchema = z.object({
  rating_value: z.coerce.number().int().min(1).max(5),
});

const ownerDashboardQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional().default(''),
  sortBy: z.enum(['name', 'email', 'address', 'rating_value', 'created_at']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

module.exports = {
  storeListQuerySchema,
  ratingSchema,
  ownerDashboardQuerySchema,
};
