import type { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.services.js";

const authService = new AuthService()
export class AuthController {
    async login(req: Request, res: Response) {
        try {
            const data = req.body
            if(!data || Object.keys(data).length === 0) {
                return res.status(400).json({
                    message: 'Request body is empty'
                })
            }
            const result = await authService.login(data)
            return res.status(200).json({
                message: 'login successfully',
                data: result
            })
        } catch (error) {
            return res.status(400).json({
                message: error instanceof Error ? error.message : 'login failed'
            })
        }
    }

    // async loginCustomer(req: Request, res: Response) {
    //     try {
    //         const data = req.body
    //         if (!data || Object.keys(data).length === 0) {
    //             return res.status(400).json({
    //                 message: 'Request body is empty'
    //             })
    //         }
    //         const result = await authService.loginCustomer(data)
    //         return res.status(200).json({
    //             message: 'login successfully',
    //             data: result
    //         })
    //     } catch (error) {
    //         return res.status(400).json({
    //             message: error instanceof Error ? error.message : 'login failed'
    //         })
    //     }
    // }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.logout()
            return res.status(200).json({
                result
            })
        } catch(error) {
            next(error)
        }
    }
}
