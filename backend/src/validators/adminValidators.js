const { z } = require('zod');

const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;
const roleEnum = z.enum(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER']);

const createUserSchema = z.object({
  name: z.string().trim().min(20).max(60),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(16).regex(passwordRegex, {
    message:
      'Password must be 8 to 16 characters and include one uppercase letter and one special character',
  }),
  address: z.string().trim().min(1).max(400),
  role: roleEnum,
});

const createStoreSchema = z.object({
  name: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(254).optional().or(z.literal('')),
  address: z.string().trim().min(1).max(400),
  owner_user_id: z
    .union([z.string().trim().regex(/^\d+$/), z.number().int().positive()])
    .optional()
    .nullable(),
});

const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional().default(''),
  role: z.enum(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER']).optional(),
  sortBy: z.string().optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

module.exports = {
  createUserSchema,
  createStoreSchema,
  adminListQuerySchema,
};
