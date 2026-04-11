import { z } from 'zod'

// POST /api/admin/products
export const CreateProductSchema = z.object({
    category_id: z
        .number()
        .int('category_id must be an integer')
        .positive('category_id must be a positive number')
        .optional(),

    name: z
        .string()
        .trim()
        .min(1, 'Product name is required')
        .max(255, 'Product name must not exceed 255 characters'),

    description: z
        .string()
        .trim()
        .max(1000, 'Description must not exceed 1000 characters')
        .optional(),

    price: z
        .number()
        .nonnegative('Price must be greater than or equal to 0'),

    image_url: z.url({ error: 'image_url must be a valid URL' }).optional(),
})

export type CreateProductInput = z.infer<typeof CreateProductSchema>

// PUT /api/admin/products/:id
export const UpdateProductSchema = z.object({
    category_id: z
        .number()
        .int('category_id must be an integer')
        .positive('category_id must be a positive number')
        .optional(),

    name: z
        .string()
        .trim()
        .min(1, 'Product name must not be empty')
        .max(255, 'Product name must not exceed 255 characters')
        .optional(),

    description: z
        .string()
        .trim()
        .max(1000, 'Description must not exceed 1000 characters')
        .optional(),

    price: z
        .number()
        .nonnegative('Price must be greater than or equal to 0')
        .optional(),

    image_url: z
        .string()
        .url('image_url must be a valid URL')
        .optional(),

    status: z
        .enum(['active', 'inactive'], {
            message: "Status must be 'active' or 'inactive'",
        })
        .optional(),
})

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>
