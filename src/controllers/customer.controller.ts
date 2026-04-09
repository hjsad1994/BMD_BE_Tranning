import type { Request, Response } from 'express'
import { CustomerServices } from '../services/customer.services.js'

const customerServices = new CustomerServices()

export class CustomerController {
    async register(req: Request, res: Response) {
        try {
            // valid use zod middleware
            const result = await customerServices.createCustomer(req.body)

            return res.status(201).json({
                success: true,
                data: result,
                message: 'Register sucessfully'
            })

        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Register failed'
            })
        }
    }
}
