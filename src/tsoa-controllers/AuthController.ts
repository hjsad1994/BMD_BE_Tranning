import { Body, Controller, Post, Request, Route, Security, Tags } from 'tsoa'
import type { Request as ExpressRequest, Response } from 'express'
import { AuthService } from '../services/auth.services.js'
import type {
    ApiResponse,
    ApiMessageResponse,
    ApiErrorResponse,
    StaffLoginResponse,
    CustomerLoginResponse,
} from '../types/api-response.types.js'

interface LoginBody {
    /** @example "admin" */
    username: string
    /** @example "Aa@123456" */
    password: string
}

const authService = new AuthService()

@Route('api/auth')
@Tags('Auth - Login & Logout')
export class AuthController extends Controller {
    /** @summary Staff login */
    @Post('login')
    async login(
        @Body() body: LoginBody
    ): Promise<ApiResponse<StaffLoginResponse> | ApiErrorResponse> {
        if (!body || Object.keys(body).length === 0) {
            this.setStatus(400)
            return { success: false, message: 'Request body is empty' }
        }
        try {
            const result = await authService.login(body)
            return { success: true, message: 'Login successfully', data: result as StaffLoginResponse }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Login failed' }
        }
    }

    /** @summary Customer login */
    @Post('client/login')
    async loginCustomer(
        @Body() body: LoginBody
    ): Promise<ApiResponse<CustomerLoginResponse> | ApiErrorResponse> {
        if (!body || Object.keys(body).length === 0) {
            this.setStatus(400)
            return { success: false, message: 'Request body is empty' }
        }
        try {
            const result = await authService.loginCustomer(body)
            return { success: true, message: 'Login successfully', data: result as CustomerLoginResponse }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Login failed' }
        }
    }

    /** @summary Logout authenticated user */
    @Post('logout')
    @Security('bearerAuth')
    async logout(@Request() _req: ExpressRequest): Promise<ApiMessageResponse | ApiErrorResponse> {
        try {
            await authService.logout()
            return { success: true, message: 'Logout successfully' }
        } catch (error) {
            this.setStatus(500)
            return { success: false, message: error instanceof Error ? error.message : 'Logout failed' }
        }
    }

    // ── Express handlers ──────────────────────────────────────────────────────

    async loginHandler(req: ExpressRequest, res: Response) {
        const data = req.body
        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({ success: false, message: 'Request body is empty' })
        }
        try {
            const result = await authService.login(data)
            return res.status(200).json({ success: true, message: 'Login successfully', data: result })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Login failed' })
        }
    }

    async loginCustomerHandler(req: ExpressRequest, res: Response) {
        const data = req.body
        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({ success: false, message: 'Request body is empty' })
        }
        try {
            const result = await authService.loginCustomer(data)
            return res.status(200).json({ success: true, message: 'Login successfully', data: result })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Login failed' })
        }
    }

    async logoutHandler(_req: ExpressRequest, res: Response) {
        try {
            await authService.logout()
            return res.status(200).json({ success: true, message: 'Logout successfully' })
        } catch (error) {
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Logout failed' })
        }
    }
}
