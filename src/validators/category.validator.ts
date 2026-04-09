import { z } from 'zod'

// POST /api/admin/categories
export const CreateCategorySchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Category name is required')
        .max(100, 'Category name must not exceed 100 characters'),

    description: z
        .string()
        .trim()
        .max(500, 'Description must not exceed 500 characters')
        .optional(),
})

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>

// PUT /api/admin/categories/:id
export const UpdateCategorySchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Category name must not be empty')
        .max(100, 'Category name must not exceed 100 characters')
        .optional(),

    description: z
        .string()
        .trim()
        .max(500, 'Description must not exceed 500 characters')
        .optional(),

    status: z
        .enum(['active', 'inactive'], {
            message: "Status must be 'active' or 'inactive'",
        })
        .optional(),
})

export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>
