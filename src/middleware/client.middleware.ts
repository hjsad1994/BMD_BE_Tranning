import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

// Middleware: only allows authenticated customers (accountType === 'user')
export function authenticateClient(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' })
        }

        const token = authHeader.split(' ')[1]
        if (!token) {
            return res.status(401).json({ success: false, message: 'Token missing' })
        }

        const secret = process.env.JWT_SECRET
        if (!secret) {
            return res.status(500).json({ success: false, message: 'JWT secret is not configured' })
        }

        const decoded = jwt.verify(token, secret) as {
            id: number
            username: string
            email: string
            accountType: 'staff' | 'user'
        }

        // Reject staff tokens — this route is for customers only
        if (decoded.accountType !== 'user') {
            return res.status(403).json({ success: false, message: 'Forbidden: customer access only' })
        }

        req.user = {
            id:          decoded.id,
            username:    decoded.username,
            email:       decoded.email,
            accountType: decoded.accountType,
        }

        next()
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' })
    }
}
