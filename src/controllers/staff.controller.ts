import type { Request, Response } from 'express'
import { StaffServices } from '../services/staff.services.js'
import "dotenv/config";

const staffService = new StaffServices()
export class StaffController {
    async initStaff(req: Request, res: Response) {
        try {
            if(process.env.ALLOW_INIT_STAFF !== 'true') {
                return res.status(403).json({
                    message: 'Init staff disabled'
                })
            }
            const result = await staffService.initStaffAccount(req.body)
            return res.status(201).json({
                message: 'Init admin account suscessfully',
                data: result
            })
        } catch (error) {
            return res.status(400).json({
                message: error instanceof Error ? error.message : 'Init admin failed'
            })
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            const staffId = req.user!.id
            const data = req.body

            // valid use zod middleware
            if (!data || Object.keys(data).length === 0) {
                return res.status(400).json({
                    message: 'Request body is empty'
                })
            }

            const result = await staffService.updateProfile(staffId, data)
            return res.status(200).json({
                success: true,
                data: result,
                message: 'Profile update successfully'
            })
        } catch(error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Server error'
            })
        }
    }

    async changePassword(req: Request, res: Response) {
        try {
            const staffId = req.user?.id
            const { oldPassword, newPassword } = req.body

            if (!staffId) {
                return res.status(401).json({
                    success: false,
                    message: 'unauthorized'
                })
            }

            await staffService.changePassword(staffId, oldPassword, newPassword)
            return res.status(200).json({
                success: true,
                message: 'Password change successfully'
            })
        } catch(error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'change password failed'
            })
        }
    }

    async getAllStaffProfile(req: Request, res: Response) {
        try  {
            const result = await staffService.getAllStaffProfile()
            return res.status(200).json({
                success: true,
                data: result,
                message: 'Get admin list successfully'
            })
        } catch(error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'server error'
            })
        }
    }

    async updateStatus(req: Request, res: Response) {
        try {
            const id = Number(req.params.id)

            if (!id || Number.isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid staff id'
                })
            }

            // valid use zod middleware
            const { status } = req.body as { status: 'active' | 'inactive' }

            await staffService.updateStatus(id, status)
            return res.status(200).json({
                success: true,
                message: 'Update status successfully'
            })
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'change status failed'
            })
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const id = Number(req.params.id)

            if (!id || Number.isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid staff id'
                })
            }

            // valid use zod middleware
            const { newPassword } = req.body

            await staffService.resetPassword(id, newPassword)
            return res.status(200).json({
                success: true,
                message: 'Reset password successfully'
            })
        } catch(error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Reset password failed'
            })
        }
    }

    async getProfile(req: Request, res: Response) {
        try {
            const staffId = req.user!.id
            const staff = await staffService.getProfileStaff(staffId)
            return res.status(200).json({
                success: true,
                data: staff,
                message: 'Get profile successfully'
            })
        } catch(error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Server error'
            })
        }
    }

    async getStaffById(req: Request, res: Response) {
        try {
            const id = Number(req.params.id)

            if (!id || Number.isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid staff id'
                })
            }

            const staff = await staffService.getStaffById(id)
            return res.status(200).json({
                success: true,
                data: staff,
                message: 'Get staff successfully'
            })
        } catch(error) {
            return res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : 'Staff not found'
            })
        }
    }
}
