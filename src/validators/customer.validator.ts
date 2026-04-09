import { z } from 'zod'

export const CreateCustomerSchema = z.object({
    username: z
        .string()
        .trim()
        .min(3, 'Username must be at least 3 characters'),

    first_name: z
        .string()
        .trim()
        .min(1, 'First name is required'),

    last_name: z
        .string()
        .trim()
        .min(1, 'Last name is required'),

    email: z
        .email('Invalid email format'),

    password: z
        .string()
        .min(8, 'Password must be at least 6 characters'),
})

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>
