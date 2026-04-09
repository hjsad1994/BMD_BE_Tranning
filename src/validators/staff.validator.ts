// backend/src/validators/staff.validator.ts
import { z } from 'zod'

const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

// POST /init-staff
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

    email: z.email({ message: 'Invalid email format' }),

    password: passwordSchema,
})

export type InitStaffInput = z.infer<typeof InitStaffSchema>

// PUT /profil at least one must be provided
export const UpdateProfileSchema = z.object({
    first_name: z
        .string()
        .trim()
        .min(1, 'First name must not be empty')
        .optional(),

    last_name: z
        .string()
        .trim()
        .min(1, 'Last name must not be empty')
        .optional(),

    email: z
        .string()
        .email({ message: 'Invalid email format' })
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
        .optional(),

    avatar: z
        .string()
        .url('Avatar must be a valid URL')
        .optional(),
})

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>

// PUT /profile/change-password
export const ChangePasswordSchema = z.object({
    oldPassword: z
        .string()
        .min(1, 'Old password is required'),

    newPassword: passwordSchema,
})

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>

// PUT /:id/reset-password
export const ResetPasswordSchema = z.object({
    newPassword: passwordSchema,
})

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>

// PATCH /:id/status
export const UpdateStatusSchema = z.object({
    status: z.enum(['active', 'inactive'], {
        message: "Status must be 'active' or 'inactive'",
    }),
})

export type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>
