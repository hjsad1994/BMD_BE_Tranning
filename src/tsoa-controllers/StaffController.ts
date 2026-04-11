import {
    Body,
    Controller,
    Get,
    Header,
    Post,
    Put,
    Query,
    Request,
    Route,
    Security,
    Tags,
    Path,
} from 'tsoa'
import type { Request as ExpressRequest, Response } from 'express'
import { StaffServices } from '../services/staff.services.js'
import type {
    ApiResponse,
    ApiMessageResponse,
    ApiErrorResponse,
    StaffResponse,
    StaffListResponse,
    CreatedIdResponse,
} from '../types/api-response.types.js'
import 'dotenv/config'

interface InitStaffBody {
    /** @example "admin" */
    username: string
    /** @example "Tai" */
    first_name: string
    /** @example "Tran" */
    last_name: string
    /** @example "admin@example.com" */
    email: string
    /** @example "Aa@123456" */
    password: string
}

interface CreateStaffBody {
    /** @example "staff01" */
    username: string
    /** @example "Tai" */
    first_name: string
    /** @example "Tran" */
    last_name: string
    /** @example "staff01@example.com" */
    email: string
    /** @example "Aa@123456" */
    password: string
}

interface StaffUpdateProfileBody {
    /** @example "Tai" */
    first_name?: string
    /** @example "Tran" */
    last_name?: string
    /** @example "admin@example.com" */
    email?: string
    /** @example "0778946513" */
    phone?: string
    /** @example "51 Duong A, TPHCM" */
    address?: string
    /** @example "https://example.com/avatar.png" */
    avatar?: string
}

interface StaffChangePasswordBody {
    /** @example "Aa@123456" */
    oldPassword: string
    /** @example "Aa@1234567" */
    newPassword: string
}

interface StaffResetPasswordBody {
    /** @example "Aa@123456" */
    newPassword: string
}

interface StaffUpdateStatusBody {
    /** @example "inactive" */
    status: 'active' | 'inactive'
}

const staffService = new StaffServices()

@Route('api/admin/staff')
@Tags('Admin - Staff')
export class StaffController extends Controller {
    /** @summary Initialize the first staff account */
    @Post('init-staff')
    async initStaff(
        @Header('x-init-secret') _xInitSecret: string,
        @Body() body: InitStaffBody
    ): Promise<ApiResponse<CreatedIdResponse> | ApiErrorResponse> {
        if (process.env.ALLOW_INIT_STAFF !== 'true') {
            this.setStatus(403)
            return { success: false, message: 'Init staff is disabled' }
        }
        try {
            const result = await staffService.initStaffAccount(body)
            this.setStatus(201)
            return { success: true, data: result as unknown as CreatedIdResponse, message: 'Init admin account successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Init admin failed' }
        }
    }

    /** @summary Get authenticated staff profile */
    @Get('profile')
    @Security('bearerAuth')
    async getProfile(
        @Request() req: ExpressRequest
    ): Promise<ApiResponse<StaffResponse> | ApiErrorResponse> {
        try {
            const staff = await staffService.getProfileStaff(req.user!.id)
            return { success: true, data: staff as unknown as StaffResponse, message: 'Get profile successfully' }
        } catch (error) {
            this.setStatus(500)
            return { success: false, message: error instanceof Error ? error.message : 'Server error' }
        }
    }

    /** @summary Update authenticated staff profile */
    @Put('profile')
    @Security('bearerAuth')
    async updateProfile(
        @Request() req: ExpressRequest,
        @Body() body: StaffUpdateProfileBody
    ): Promise<ApiMessageResponse | ApiErrorResponse> {
        if (!body || Object.keys(body).length === 0) {
            this.setStatus(400)
            return { success: false, message: 'Request body is empty' }
        }
        try {
            await staffService.updateProfile(req.user!.id, body)
            return { success: true, message: 'Profile updated successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Update profile failed' }
        }
    }

    /** @summary Get all staff profiles */
    @Get()
    @Security('bearerAuth')
    async getAllStaffProfile(
        /** @example 1 */  @Query() page: number = 1,
        /** @example 20 */ @Query() limit: number = 20
    ): Promise<ApiResponse<StaffListResponse> | ApiErrorResponse> {
        if (page < 1 || !Number.isInteger(Number(page))) {
            this.setStatus(400)
            return { success: false, message: 'page must be a positive integer >= 1' }
        }
        if (limit < 1 || limit > 100) {
            this.setStatus(400)
            return { success: false, message: 'limit must be between 1 and 100' }
        }
        try {
            const result = await staffService.getAllStaffProfile(Number(page), Number(limit))
            return { success: true, data: result as StaffListResponse, message: 'Get staff list successfully' }
        } catch (error) {
            this.setStatus(500)
            return { success: false, message: error instanceof Error ? error.message : 'Server error' }
        }
    }

    /** @summary Create a new staff account */
    @Post()
    @Security('bearerAuth')
    async createStaff(
        @Body() body: CreateStaffBody
    ): Promise<ApiResponse<CreatedIdResponse> | ApiErrorResponse> {
        try {
            const result = await staffService.createStaff(body)
            this.setStatus(201)
            return { success: true, data: result as unknown as CreatedIdResponse, message: 'Staff created successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Create staff failed' }
        }
    }

    /** @summary Get a staff member by ID */
    @Get('{staffId}')
    @Security('bearerAuth')
    async getStaffById(/** @example 1 */ @Path() staffId: number): Promise<ApiResponse<StaffResponse> | ApiErrorResponse> {
        if (!staffId || Number.isNaN(staffId)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid staff id' }
        }
        try {
            const staff = await staffService.getStaffById(staffId)
            return { success: true, data: staff as unknown as StaffResponse, message: 'Get staff successfully' }
        } catch (error) {
            this.setStatus(404)
            return { success: false, message: error instanceof Error ? error.message : 'Staff not found' }
        }
    }

    /** @summary Change password for authenticated staff */
    @Put('profile/change-password')
    @Security('bearerAuth')
    async changePassword(
        @Request() req: ExpressRequest,
        @Body() body: StaffChangePasswordBody
    ): Promise<ApiMessageResponse | ApiErrorResponse> {
        const staffId = req.user?.id
        if (!staffId) {
            this.setStatus(401)
            return { success: false, message: 'Unauthorized' }
        }
        try {
            await staffService.changePassword(staffId, body.oldPassword, body.newPassword)
            return { success: true, message: 'Password changed successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Change password failed' }
        }
    }

    /** @summary Reset password for a staff member by ID */
    @Put('reset-password')
    @Security('bearerAuth')
    async resetPassword(
        /** @example 1 */ @Query() id: number,
        @Body() body: StaffResetPasswordBody
    ): Promise<ApiMessageResponse | ApiErrorResponse> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid staff id' }
        }
        try {
            await staffService.resetPassword(id, body.newPassword)
            return { success: true, message: 'Password reset successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Reset password failed' }
        }
    }

    /** @summary Update status of a staff member by ID */
    @Put('status')
    @Security('bearerAuth')
    async updateStatus(
        /** @example 1 */ @Query() id: number,
        @Body() body: StaffUpdateStatusBody
    ): Promise<ApiMessageResponse | ApiErrorResponse> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid staff id' }
        }
        try {
            await staffService.updateStatus(id, body.status)
            return { success: true, message: 'Status updated successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Update status failed' }
        }
    }

    // ── Express handlers ──────────────────────────────────────────────────────

    async initStaffHandler(req: ExpressRequest, res: Response) {
        if (process.env.ALLOW_INIT_STAFF !== 'true') {
            return res.status(403).json({ success: false, message: 'Init staff is disabled' })
        }
        try {
            const result = await staffService.initStaffAccount(req.body)
            return res.status(201).json({ success: true, data: result, message: 'Init admin account successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Init admin failed' })
        }
    }

    async getProfileHandler(req: ExpressRequest, res: Response) {
        try {
            const staff = await staffService.getProfileStaff(req.user!.id)
            return res.status(200).json({ success: true, data: staff, message: 'Get profile successfully' })
        } catch (error) {
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' })
        }
    }

    async updateProfileHandler(req: ExpressRequest, res: Response) {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: 'Request body is empty' })
        }
        try {
            await staffService.updateProfile(req.user!.id, req.body)
            return res.status(200).json({ success: true, message: 'Profile updated successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Update profile failed' })
        }
    }

    async getAllStaffProfileHandler(req: ExpressRequest, res: Response) {
        const page  = Number(req.query.page)  || 1
        const limit = Number(req.query.limit) || 20
        if (page < 1) {
            return res.status(400).json({ success: false, message: 'page must be >= 1' })
        }
        if (limit < 1 || limit > 100) {
            return res.status(400).json({ success: false, message: 'limit must be between 1 and 100' })
        }
        try {
            const result = await staffService.getAllStaffProfile(page, limit)
            return res.status(200).json({ success: true, data: result, message: 'Get staff list successfully' })
        } catch (error) {
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' })
        }
    }

    async createStaffHandler(req: ExpressRequest, res: Response) {
        try {
            const result = await staffService.createStaff(req.body)
            return res.status(201).json({ success: true, data: result, message: 'Staff created successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Create staff failed' })
        }
    }

    async getStaffByIdHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.params.staffId)
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid staff id' })
        }
        try {
            const staff = await staffService.getStaffById(id)
            return res.status(200).json({ success: true, data: staff, message: 'Get staff successfully' })
        } catch (error) {
            return res.status(404).json({ success: false, message: error instanceof Error ? error.message : 'Staff not found' })
        }
    }

    async changePasswordHandler(req: ExpressRequest, res: Response) {
        const staffId = req.user?.id
        if (!staffId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' })
        }
        const { oldPassword, newPassword } = req.body
        try {
            await staffService.changePassword(staffId, oldPassword, newPassword)
            return res.status(200).json({ success: true, message: 'Password changed successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Change password failed' })
        }
    }

    async resetPasswordHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.query.id)
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid staff id' })
        }
        try {
            await staffService.resetPassword(id, req.body.newPassword)
            return res.status(200).json({ success: true, message: 'Password reset successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Reset password failed' })
        }
    }

    async updateStatusHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.query.id)
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid staff id' })
        }
        const { status } = req.body as { status: 'active' | 'inactive' }
        try {
            await staffService.updateStatus(id, status)
            return res.status(200).json({ success: true, message: 'Status updated successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Update status failed' })
        }
    }
}
