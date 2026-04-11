// backend/src/validators/customer.validator.ts
import { z } from 'zod'

const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

// PUT /api/customer/profile
export const UpdateProfileSchema = z
    .object({
        first_name: z
            .string()
            .trim()
            .min(1, 'First name must not be empty')
            .max(100, 'First name must not exceed 100 characters')
            .optional(),

        last_name: z
            .string()
            .trim()
            .min(1, 'Last name must not be empty')
            .max(100, 'Last name must not exceed 100 characters')
            .optional(),

        email: z
            .string()
            .email('Invalid email format')
            .optional(),

        phone: z
            .string()
            .trim()
            .regex(/^\+?[0-9]{7,15}$/, 'Invalid phone number')
            .optional(),

        address: z
            .string()
            .trim()
            .min(1, 'Address must not be empty')
            .max(255, 'Address must not exceed 255 characters')
            .optional(),

        avatar: z
            .string()
            .url('Avatar must be a valid URL')
            .optional(),
    })
    .refine(
        (data) => Object.keys(data).length > 0,
        { message: 'At least one field must be provided' }
    )

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>

// PUT /api/customer/change-password
export const ChangePasswordSchema = z
    .object({
        current_password: z
            .string()
            .min(1, 'Current password is required'),

        new_password: passwordSchema,
    })
    .refine(
        (data) => data.current_password !== data.new_password,
        { message: 'New password must be different from current password', path: ['new_password'] }
    )

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>
