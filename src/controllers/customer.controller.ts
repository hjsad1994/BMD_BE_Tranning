import { CustomerServices } from './../services/customer.services.js';
import type { Request, Response } from 'express'
import { CreateCustomerSchema } from '../validators/customer.validator.js'
import z from 'zod'
const customerServices = new CustomerServices()

export class CustomerController {
    async createCustomer(req: Request, res: Response) {
        if(!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ 
                message: 'Request body is empty' 
            })       
        }
        const parsed = CreateCustomerSchema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: z.flattenError(parsed.error).fieldErrors
            })
        }
    }
}