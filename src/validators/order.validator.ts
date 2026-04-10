import { z } from 'zod'

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'] as const

export const UpdateOrderStatusSchema = z.object({
    status: z.enum(ORDER_STATUSES, {
        message: 'Status must be one of: PENDING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED',
    }),
    note: z
        .string()
        .trim()
        .max(255, 'Note must not exceed 255 characters')
        .optional(),
})

export const CreateOrderSchema = z.object({
    customer_id: z
        .number({ message: 'customer_id must be a number' })
        .int('customer_id must be an integer')
        .positive('customer_id must be a positive number'),

    shipping_address: z
        .string()
        .trim()
        .min(5, 'Shipping address must be at least 5 characters')
        .max(255, 'Shipping address must not exceed 255 characters'),

    items: z
        .array(
            z.object({
                product_id: z
                    .number({ message: 'product_id must be a number' })
                    .int('product_id must be an integer')
                    .positive('product_id must be a positive number'),

                quantity: z
                    .number({ message: 'quantity must be a number' })
                    .int('quantity must be an integer')
                    .min(1, 'quantity must be at least 1')
                    .max(1000, 'quantity must not exceed 1000'),
            })
        )
        .min(1, 'Order must have at least 1 item')
        .max(50, 'Order must not exceed 50 items')
        // Prevent duplicate product_id within the same order
        .refine(
            (items) => {
                const ids = items.map(i => i.product_id)
                return new Set(ids).size === ids.length
            },
            { message: 'Duplicate product_id found in items' }
        ),
})

export const CancelOrderSchema = z.object({
    note: z
        .string()
        .trim()
        .max(255, 'Note must not exceed 255 characters')
        .optional(),
})

export type CreateOrderInput       = z.infer<typeof CreateOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>
export type CancelOrderInput       = z.infer<typeof CancelOrderSchema>
