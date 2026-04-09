// backend/src/validators/staff.validator.ts
import { z } from 'zod'

export const InitStaffSchema = z.object({
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
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
})

export type InitStaffInput = z.infer<typeof InitStaffSchema>
