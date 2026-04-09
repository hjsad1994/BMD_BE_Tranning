// backend/src/middleware/validate.middleware.ts
import type { Request, Response, NextFunction } from 'express'
import type { ZodType } from 'zod'
import { ZodError } from 'zod'

/**
 * Returns an Express middleware that validates req.body against the given Zod schema.
 * On failure it responds 422 with a structured list of field errors.
 */
export function validate(schema: ZodType) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body)
        if (!result.success) {
            const errors = (result.error as ZodError).issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }))
            return res.status(422).json({
                success: false,
                message: 'Validation failed',
                errors,
            })
        }
        // Replace req.body with the parsed (trimmed / coerced) data
        req.body = result.data
        next()
    }
}
