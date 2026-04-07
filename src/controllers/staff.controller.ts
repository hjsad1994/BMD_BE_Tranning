import type { Request, Response } from 'express'
import { StaffServices } from '../services/staff.services.js'
import "dotenv/config";


const StaffService = new StaffServices()

export class StaffController {
    async initStaff(req: Request, res: Response) {
        try {
            if(process.env.ALLOW_INIT_STAFF !== 'true') {
                return res.status(403).json({
                    message: 'Init staff disable'
                })
            }
            const result = await StaffService.initStaffAccount(req.body) 
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
}