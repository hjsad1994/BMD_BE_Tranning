import { Body, Controller, Post, Request, Route, Security, Tags } from 'tsoa'
import type { Request as ExpressRequest, Response } from 'express'
import { AuthService } from '../services/auth.services.js'

interface LoginBody {
    /** @example "admin" */
    username: string
    /** @example "Aa@123456" */
    password: string
}

const authService = new AuthService()

@Route('api/auth')
@Tags('Auth')
export class AuthController extends Controller {
    /**
     * @summary Login with username and password
     */
    @Post('login')
    async login(@Body() body: LoginBody): Promise<unknown> {
        if (!body || Object.keys(body).length === 0) {
            this.setStatus(400)
            return { message: 'Request body is empty' }
        }
        try {
            const result = await authService.login(body)
            return { message: 'login successfully', data: result }
        } catch (error) {
            this.setStatus(400)
            return { message: error instanceof Error ? error.message : 'login failed' }
        }
    }

    /**
     * @summary Logout authenticated user
     */
    @Post('logout')
    @Security('bearerAuth')
    async logout(@Request() _req: ExpressRequest): Promise<unknown> {
        try {
            const result = await authService.logout()
            return { result }
        } catch (error) {
            this.setStatus(500)
            return { message: error instanceof Error ? error.message : 'logout failed' }
        }
    }

    // ── Express-compatible handlers used by routes ──────────────────────────

    async loginHandler(req: ExpressRequest, res: Response) {
        const data = req.body
        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({ message: 'Request body is empty' })
        }
        try {
            const result = await authService.login(data)
            return res.status(200).json({ message: 'login successfully', data: result })
        } catch (error) {
            return res.status(400).json({
                message: error instanceof Error ? error.message : 'login failed',
            })
        }
    }

    async logoutHandler(_req: ExpressRequest, res: Response) {
        try {
            const result = await authService.logout()
            return res.status(200).json({ result })
        } catch (error) {
            return res.status(500).json({
                message: error instanceof Error ? error.message : 'logout failed',
            })
        }
    }
}
