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

    email: z.email({ message: 'Invalid email format' }),

    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
})

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>

// PUT /api/admin/customers?id=
export const UpdateCustomerSchema = z.object({
    first_name: z.string().trim().min(1, 'First name must not be empty').optional(),
    last_name:  z.string().trim().min(1, 'Last name must not be empty').optional(),
    email:      z.string().email({ message: 'Invalid email format' }).optional(),
    phone:      z.string().trim().regex(/^\+?[0-9]{7,15}$/, 'Invalid phone number').optional(),
    address:    z.string().trim().min(1, 'Address must not be empty').optional(),
    avatar:     z.string().url('Avatar must be a valid URL').optional(),
})

export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>

// PUT /api/admin/customers/status?id=
export const UpdateCustomerStatusSchema = z.object({
    status: z.enum(['active', 'inactive'], {
        message: "Status must be 'active' or 'inactive'",
    }),
})

export type UpdateCustomerStatusInput = z.infer<typeof UpdateCustomerStatusSchema>

// PUT /api/admin/customers/reset-password?id=
export const AdminResetPasswordSchema = z.object({
    new_password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
})

export type AdminResetPasswordInput = z.infer<typeof AdminResetPasswordSchema>
