import {
    Body,
    Controller,
    Delete,
    Get,
    Path,
    Post,
    Put,
    Query,
    Route,
    Security,
    Tags,
} from 'tsoa'
import type { Request as ExpressRequest, Response } from 'express'
import { CustomerServices } from '../services/client-admin.services.js'
import type {
    ApiResponse,
    ApiMessageResponse,
    ApiErrorResponse,
    CustomerResponse,
    CustomerListResponse,
    CreatedIdResponse,
} from '../types/api-response.types.js'

interface CreateCustomerBody {
    /** @example "user1" */
    username: string
    /** @example "Tran" */
    first_name: string
    /** @example "Tai" */
    last_name: string
    /** @example "user1@example.com" */
    email: string
    /** @example "Aa@123456" */
    password: string
}

interface UpdateCustomerBody {
    /** @example "Tran" */
    first_name?: string
    /** @example "Tai" */
    last_name?: string
    /** @example "user1@example.com" */
    email?: string
    /** @example "0778946513" */
    phone?: string
    /** @example "51 Duong A, TPHCM" */
    address?: string
    /** @example "https://example.com/avatar.png" */
    avatar?: string
}

interface UpdateCustomerStatusBody {
    /** @example "inactive" */
    status: 'active' | 'inactive'
}

interface AdminResetPasswordBody {
    /** @example "NewPass@123" */
    new_password: string
}

const customerService = new CustomerServices()

@Route('api/admin/customers')
@Tags('Admin - Client')
@Security('bearerAuth')
export class ClientAdminController extends Controller {
    /** @summary Get all customers */
    @Get()
    async getAllCustomers(
        /** @example 1 */  @Query() page: number = 1,
        /** @example 20 */ @Query() limit: number = 20
    ): Promise<ApiResponse<CustomerListResponse> | ApiErrorResponse> {
        if (page < 1 || !Number.isInteger(Number(page))) {
            this.setStatus(400)
            return { success: false, message: 'page must be a positive integer >= 1' }
        }
        if (limit < 1 || limit > 100) {
            this.setStatus(400)
            return { success: false, message: 'limit must be between 1 and 100' }
        }
        try {
            const result = await customerService.getAllCustomers(Number(page), Number(limit))
            return { success: true, data: result as CustomerListResponse, message: 'Get customers successfully' }
        } catch (error) {
            this.setStatus(500)
            return { success: false, message: error instanceof Error ? error.message : 'Server error' }
        }
    }

    /** @summary Create a new customer account */
    @Post()
    async createCustomer(
        @Body() body: CreateCustomerBody
    ): Promise<ApiResponse<CreatedIdResponse> | ApiErrorResponse> {
        try {
            const result = await customerService.createCustomer({ ...body, status: 'active' })
            this.setStatus(201)
            return { success: true, data: result as CreatedIdResponse, message: 'Customer created successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Create customer failed' }
        }
    }

    /** @summary Get a customer by ID */
    @Get('{customerId}')
    async getCustomerById(
        /** @example 1 */ @Path() customerId: number
    ): Promise<ApiResponse<CustomerResponse> | ApiErrorResponse> {
        if (!customerId || Number.isNaN(customerId)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid customer id' }
        }
        try {
            const result = await customerService.getCustomerById(customerId)
            return { success: true, data: result as unknown as CustomerResponse, message: 'Get customer successfully' }
        } catch (error) {
            this.setStatus(404)
            return { success: false, message: error instanceof Error ? error.message : 'Customer not found' }
        }
    }

    /** @summary Update a customer */
    @Put()
    async updateCustomer(
        /** @example 1 */ @Query() id: number,
        @Body() body: UpdateCustomerBody
    ): Promise<ApiMessageResponse | ApiErrorResponse> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid customer id' }
        }
        if (!body || Object.keys(body).length === 0) {
            this.setStatus(400)
            return { success: false, message: 'Request body is empty' }
        }
        try {
            await customerService.updateCustomer(id, body)
            return { success: true, message: 'Customer updated successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Update customer failed' }
        }
    }

    /** @summary Update customer status */
    @Put('status')
    async updateStatus(
        /** @example 1 */ @Query() id: number,
        @Body() body: UpdateCustomerStatusBody
    ): Promise<ApiMessageResponse | ApiErrorResponse> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid customer id' }
        }
        try {
            await customerService.updateStatus(id, body.status)
            return { success: true, message: 'Customer status updated successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Update status failed' }
        }
    }

    /** @summary Delete a customer */
    @Delete()
    async deleteCustomer(
        /** @example 1 */ @Query() id: number
    ): Promise<ApiMessageResponse | ApiErrorResponse> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid customer id' }
        }
        try {
            await customerService.deleteCustomer(id)
            return { success: true, message: 'Customer deleted successfully' }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Delete customer failed'
            this.setStatus(message === 'Customer not found' ? 404 : 400)
            return { success: false, message }
        }
    }

    /** @summary Restore a deleted customer */
    @Put('restore')
    async restoreCustomer(
        /** @example 1 */ @Query() id: number
    ): Promise<ApiMessageResponse | ApiErrorResponse> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid customer id' }
        }
        try {
            await customerService.restoreCustomer(id)
            return { success: true, message: 'Customer restored successfully' }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Restore customer failed'
            this.setStatus(message === 'Customer not found or not deleted' ? 404 : 400)
            return { success: false, message }
        }
    }

    /** @summary Reset a customer's password (admin only) */
    @Put('reset-password')
    async resetPassword(
        /** @example 1 */ @Query() id: number,
        @Body() body: AdminResetPasswordBody
    ): Promise<ApiMessageResponse | ApiErrorResponse> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid customer id' }
        }
        try {
            await customerService.resetPassword(id, body.new_password)
            return { success: true, message: 'Password reset successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Reset password failed' }
        }
    }

    // ── Express handlers ──────────────────────────────────────────────────────

    async registerHandler(req: ExpressRequest, res: Response) {
        try {
            const result = await customerService.createCustomer(req.body)
            return res.status(201).json({ success: true, data: result, message: 'Register successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Register failed' })
        }
    }

    async createCustomerHandler(req: ExpressRequest, res: Response) {
        try {
            const result = await customerService.createCustomer(req.body)
            return res.status(201).json({ success: true, data: result, message: 'Customer created successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Create customer failed' })
        }
    }

    async getAllCustomersHandler(req: ExpressRequest, res: Response) {
        const page  = Number(req.query.page)  || 1
        const limit = Number(req.query.limit) || 20
        if (page < 1) {
            return res.status(400).json({ success: false, message: 'page must be >= 1' })
        }
        if (limit < 1 || limit > 100) {
            return res.status(400).json({ success: false, message: 'limit must be between 1 and 100' })
        }
        try {
            const result = await customerService.getAllCustomers(page, limit)
            return res.status(200).json({ success: true, data: result, message: 'Get customers successfully' })
        } catch (error) {
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' })
        }
    }

    async getCustomerByIdHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.params.customerId)
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid customer id' })
        }
        try {
            const result = await customerService.getCustomerById(id)
            return res.status(200).json({ success: true, data: result, message: 'Get customer successfully' })
        } catch (error) {
            return res.status(404).json({ success: false, message: error instanceof Error ? error.message : 'Customer not found' })
        }
    }

    async updateCustomerHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.query.id)
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid customer id' })
        }
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: 'Request body is empty' })
        }
        try {
            await customerService.updateCustomer(id, req.body)
            return res.status(200).json({ success: true, message: 'Customer updated successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Update customer failed' })
        }
    }

    async updateStatusHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.query.id)
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid customer id' })
        }
        const { status } = req.body as { status: 'active' | 'inactive' }
        try {
            await customerService.updateStatus(id, status)
            return res.status(200).json({ success: true, message: 'Customer status updated successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Update status failed' })
        }
    }

    async deleteCustomerHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.query.id)
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid customer id' })
        }
        try {
            await customerService.deleteCustomer(id)
            return res.status(200).json({ success: true, message: 'Customer deleted successfully' })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Delete customer failed'
            const status = message === 'Customer not found' ? 404 : 400
            return res.status(status).json({ success: false, message })
        }
    }

    async restoreCustomerHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.query.id)
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid customer id' })
        }
        try {
            await customerService.restoreCustomer(id)
            return res.status(200).json({ success: true, message: 'Customer restored successfully' })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Restore customer failed'
            const status = message === 'Customer not found or not deleted' ? 404 : 400
            return res.status(status).json({ success: false, message })
        }
    }

    async resetPasswordHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.query.id)
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid customer id' })
        }
        try {
            await customerService.resetPassword(id, req.body.new_password)
            return res.status(200).json({ success: true, message: 'Password reset successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Reset password failed' })
        }
    }
}
