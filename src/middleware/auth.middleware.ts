import { StaffRepository } from './../repository/staff.repository.js';
import type {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

const staffRepository = new StaffRepository()
export function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization
        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'unauthorized'
            })
        }
        const token = authHeader.split(' ')[1]
        if (!token) {
            return res.status(401).json({
                message: 'Token missing'
            })
        }
        const secret = process.env.JWT_SECRET
        if(!secret) {
            return res.status(500).json({
                message: 'JWT secret is not configured'
            })
        }
        const decoded = jwt.verify(token, secret) as {
            id: number
            username: string
            email: string
            accountType: 'staff' | 'user'
          }

        req.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
            accountType: decoded.accountType,
        }

        next()
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token'
        })
    }
}