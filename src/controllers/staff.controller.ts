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
            const staffId = Number(req.params.id) 
            const data = req.body
            // check body is empty
            if(!data || Object.keys(data).length === 0 ) {
                return res.status(400).json({
                    message: 'Request body is empty'
                })
            }
            // check staff id 
            if(Number.isNaN(staffId)) {
                return res.status(400).json({
                    message: 'invalid staff id'
                })
            }
            const result = await staffService.updateProfile(staffId, data)
            return res.status(200).json({
                success: true,
                data: result,
                message: 'Profile update successfully'
            })
        } catch(error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Server error'
            })
        }
    }
}