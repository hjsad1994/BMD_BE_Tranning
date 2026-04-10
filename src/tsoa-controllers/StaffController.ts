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
} from 'tsoa'
import type { Request as ExpressRequest, Response } from 'express'
import { StaffServices } from '../services/staff.services.js'
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

interface UpdateProfileBody {
    /** @example "Tai" */
    first_name?: string
    /** @example "Tran" */
    last_name?: string
    /** @example "admin@example.com" */
    email?: string
    /** @example "0778946513" */
    phone?: string
    /** @example "51 Duong A , TPHCM" */
    address?: string
    /** @example "https://example.com/avatar.png" */
    avatar?: string
}

interface ChangePasswordBody {
    /** @example "Aa@123456" */
    oldPassword: string
    /** @example "Aa@1234567" */
    newPassword: string
}

interface ResetPasswordBody {
    /** @example "Aa@123456" */
    newPassword: string
}

interface UpdateStatusBody {
    /** @example "inactive" */
    status: 'active' | 'inactive'
}

const staffService = new StaffServices()

@Route('api/admin/staff')
@Tags('Staff')
export class StaffController extends Controller {
    /**
     * @summary Initialize the first staff account
     */
    @Post('init-staff')
    async initStaff(
        @Header('x-init-secret') _xInitSecret: string,
        @Body() body: InitStaffBody
    ): Promise<unknown> {
        if (process.env.ALLOW_INIT_STAFF !== 'true') {
            this.setStatus(403)
            return { message: 'Init staff is disable' }
        }
        try {
            const result = await staffService.initStaffAccount(body)
            this.setStatus(201)
            return { message: 'Init admin account suscessfully', data: result }
        } catch (error) {
            this.setStatus(400)
            return { message: error instanceof Error ? error.message : 'Init admin failed' }
        }
    }

    /** @summary Get authenticated staff profile */
    @Get('profile')
    @Security('bearerAuth')
    async getProfile(@Request() req: ExpressRequest): Promise<unknown> {
        try {
            const staff = await staffService.getProfileStaff(req.user!.id)
            return { success: true, data: staff, message: 'Get profile successfully' }
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
        @Body() body: UpdateProfileBody
    ): Promise<unknown> {
        try {
            if (!body || Object.keys(body).length === 0) {
                this.setStatus(400)
                return { message: 'Request body is empty' }
            }
            const result = await staffService.updateProfile(req.user!.id, body)
            return { success: true, data: result, message: 'Profile update successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Server error' }
        }
    }

    /** @summary Get all staff profiles */
    @Get()
    @Security('bearerAuth')
    async getAllStaffProfile(): Promise<unknown> {
        try {
            const result = await staffService.getAllStaffProfile()
            return { success: true, data: result, message: 'Get admin list successfully' }
        } catch (error) {
            this.setStatus(500)
            return { success: false, message: error instanceof Error ? error.message : 'server error' }
        }
    }

    /** @summary Create a new staff account */
    @Post()
    @Security('bearerAuth')
    async createStaff(@Body() body: CreateStaffBody): Promise<unknown> {
        try {
            const result = await staffService.createStaff(body)
            this.setStatus(201)
            return { success: true, data: result, message: 'Staff created successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Create staff failed' }
        }
    }

    /** @summary Get a staff member by ID */
    @Get('detail')
    @Security('bearerAuth')
    async getStaffById(/** @example 1 */ @Query() id: number): Promise<unknown> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid staff id' }
        }
        try {
            const staff = await staffService.getStaffById(id)
            return { success: true, data: staff, message: 'Get staff successfully' }
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
        @Body() body: ChangePasswordBody
    ): Promise<unknown> {
        const staffId = req.user?.id
        if (!staffId) {
            this.setStatus(401)
            return { success: false, message: 'unauthorized' }
        }
        try {
            await staffService.changePassword(staffId, body.oldPassword, body.newPassword)
            return { success: true, message: 'Password change successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'change password failed' }
        }
    }

    /** @summary Reset password for a staff member by ID */
    @Put('reset-password')
    @Security('bearerAuth')
    async resetPassword(
        /** @example 1 */ @Query() id: number,
        @Body() body: ResetPasswordBody
    ): Promise<unknown> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid staff id' }
        }
        try {
            await staffService.resetPassword(id, body.newPassword)
            return { success: true, message: 'Reset password successfully' }
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
        @Body() body: UpdateStatusBody
    ): Promise<unknown> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid staff id' }
        }
        try {
            await staffService.updateStatus(id, body.status)
            return { success: true, message: 'Update status successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'change status failed' }
        }
    }

    // ── Express-compatible handlers used by routes

    async initStaffHandler(req: ExpressRequest, res: Response) {
        if (process.env.ALLOW_INIT_STAFF !== 'true') {
            return res.status(403).json({ message: 'Init staff is disable' })
        }
        try {
            const result = await staffService.initStaffAccount(req.body)
            return res.status(201).json({ message: 'Init admin account suscessfully', data: result })
        } catch (error) {
            return res.status(400).json({ message: error instanceof Error ? error.message : 'Init admin failed' })
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
        try {
            const staffId = req.user!.id
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({ message: 'Request body is empty' })
            }
            const result = await staffService.updateProfile(staffId, req.body)
            return res.status(200).json({ success: true, data: result, message: 'Profile update successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Server error' })
        }
    }

    async getAllStaffProfileHandler(_req: ExpressRequest, res: Response) {
        try {
            const result = await staffService.getAllStaffProfile()
            return res.status(200).json({ success: true, data: result, message: 'Get admin list successfully' })
        } catch (error) {
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'server error' })
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
        const id = Number(req.query.id)
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
            return res.status(401).json({ success: false, message: 'unauthorized' })
        }
        const { oldPassword, newPassword } = req.body
        try {
            await staffService.changePassword(staffId, oldPassword, newPassword)
            return res.status(200).json({ success: true, message: 'Password change successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'change password failed' })
        }
    }

    async resetPasswordHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.query.id)
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid staff id' })
        }
        const { newPassword } = req.body
        try {
            await staffService.resetPassword(id, newPassword)
            return res.status(200).json({ success: true, message: 'Reset password successfully' })
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
            return res.status(200).json({ success: true, message: 'Update status successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'change status failed' })
        }
    }
}
