import type { Request, Response } from 'express'
import { CustomerServices } from '../services/customer.services.js'

const customerServices = new CustomerServices()

export class CustomerController {

    async register(req: Request, res: Response) {
        try {
            const result = await customerServices.createCustomer(req.body)
            return res.status(201).json({
                success: true,
                data: result,
                message: 'Register successfully'
            })
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Register failed'
            })
        }
    }

    async createCustomer(req: Request, res: Response) {
        try {
            const result = await customerServices.createCustomer(req.body)
            return res.status(201).json({
                success: true,
                data: result,
                message: 'Customer created successfully'
            })
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Create customer failed'
            })
        }
    }

    async getAllCustomers(_req: Request, res: Response) {
        try {
            const result = await customerServices.getAllCustomers()
            return res.status(200).json({
                success: true,
                data: result,
                message: 'Get customers successfully'
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Server error'
            })
        }
    }

    async getCustomerById(req: Request, res: Response) {
        try {
            const id = Number(req.query.id)

            if (!id || Number.isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid customer id'
                })
            }

            const result = await customerServices.getCustomerById(id)
            return res.status(200).json({
                success: true,
                data: result,
                message: 'Get customer successfully'
            })
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : 'Customer not found'
            })
        }
    }

    async updateCustomer(req: Request, res: Response) {
        try {
            const id = Number(req.query.id)

            if (!id || Number.isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid customer id'
                })
            }

            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Request body is empty'
                })
            }

            await customerServices.updateCustomer(id, req.body)
            return res.status(200).json({
                success: true,
                message: 'Customer updated successfully'
            })
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Update customer failed'
            })
        }
    }

    async updateStatus(req: Request, res: Response) {
        try {
            const id = Number(req.query.id)

            if (!id || Number.isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid customer id'
                })
            }

            const { status } = req.body as { status: 'active' | 'inactive' }

            await customerServices.updateStatus(id, status)
            return res.status(200).json({
                success: true,
                message: 'Customer status updated successfully'
            })
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Update status failed'
            })
        }
    }

    async deleteCustomer(req: Request, res: Response) {
        try {
            const id = Number(req.query.id)

            if (!id || Number.isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid customer id'
                })
            }

            await customerServices.deleteCustomer(id)
            return res.status(200).json({
                success: true,
                message: 'Customer deleted successfully'
            })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Delete customer failed'
            const status = message === 'Customer not found' ? 404 : 400
            return res.status(status).json({
                success: false,
                message
            })
        }
    }

    async restoreCustomer(req: Request, res: Response) {
        try {
            const id = Number(req.query.id)

            if (!id || Number.isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid customer id'
                })
            }

            await customerServices.restoreCustomer(id)
            return res.status(200).json({
                success: true,
                message: 'Customer restored successfully'
            })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Restore customer failed'
            const status = message === 'Customer not found or not deleted' ? 404 : 400
            return res.status(status).json({
                success: false,
                message
            })
        }
    }
}
