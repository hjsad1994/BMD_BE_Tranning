import {
    Body,
    Controller,
    Delete,
    Get,
    Put,
    Route,
    Security,
    Tags,
} from 'tsoa'
import type { Request as ExpressRequest, Response } from 'express'
import { ClientService } from '../services/client.services.js'
import type {
    ApiResponse,
    ApiMessageResponse,
    ApiErrorResponse,
    CustomerResponse,
} from '../types/api-response.types.js'

interface ClientUpdateProfileBody {
    /** @example "Tran" */
    first_name?: string
    /** @example "Tai" */
    last_name?: string
    /** @example "newemail@example.com" */
    email?: string
    /** @example "0901234567" */
    phone?: string
    /** @example "123 Le Loi, Q1, TPHCM" */
    address?: string
    /** @example "https://example.com/avatar.png" */
    avatar?: string
}

interface ClientChangePasswordBody {
    /** @example "OldPass@123" */
    current_password: string
    /** @example "NewPass@456" */
    new_password: string
}

const clientService = new ClientService()

@Route('api/client')
@Tags('Client - Profile')
@Security('bearerAuth')
export class ClientController extends Controller {

    /** @summary Get my profile */
    @Get('profile')
    async getProfile(): Promise<ApiResponse<CustomerResponse> | ApiErrorResponse> {
        // customerId comes from JWT — handled by Express handler
        return { success: false, message: 'Use Express handler' }
    }

    /** @summary Update my profile */
    @Put('profile')
    async updateProfile(
        @Body() _body: ClientUpdateProfileBody
    ): Promise<ApiMessageResponse | ApiErrorResponse> {
        return { success: false, message: 'Use Express handler' }
    }

    /** @summary Change my password */
    @Put('change-password')
    async changePassword(
        @Body() _body: ClientChangePasswordBody
    ): Promise<ApiMessageResponse | ApiErrorResponse> {
        return { success: false, message: 'Use Express handler' }
    }

    /** @summary Delete my account */
    @Delete('account')
    async deleteAccount(): Promise<ApiMessageResponse | ApiErrorResponse> {
        return { success: false, message: 'Use Express handler' }
    }

    // ── Express handlers ──────────────────────────────────────────────────────

    async getProfileHandler(req: ExpressRequest, res: Response) {
        const customerId = req.user?.id
        if (!customerId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' })
        }
        try {
            const result = await clientService.getProfile(customerId)
            return res.status(200).json({ success: true, data: result, message: 'Get profile successfully' })
        } catch (error) {
            return res.status(404).json({ success: false, message: error instanceof Error ? error.message : 'Profile not found' })
        }
    }

    async updateProfileHandler(req: ExpressRequest, res: Response) {
        const customerId = req.user?.id
        if (!customerId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' })
        }
        try {
            await clientService.updateProfile(customerId, req.body)
            return res.status(200).json({ success: true, message: 'Profile updated successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Update profile failed' })
        }
    }

    async changePasswordHandler(req: ExpressRequest, res: Response) {
        const customerId = req.user?.id
        if (!customerId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' })
        }
        const { current_password, new_password } = req.body
        try {
            await clientService.changePassword(customerId, current_password, new_password)
            return res.status(200).json({ success: true, message: 'Password changed successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Change password failed' })
        }
    }

    async deleteAccountHandler(req: ExpressRequest, res: Response) {
        const customerId = req.user?.id
        if (!customerId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' })
        }
        try {
            await clientService.deleteAccount(customerId)
            return res.status(200).json({ success: true, message: 'Account deleted successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Delete account failed' })
        }
    }
}
