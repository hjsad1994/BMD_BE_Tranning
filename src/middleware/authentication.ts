import type { Request } from 'express'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

// tsoa calls this function when a route has @Security('bearerAuth')
export function expressAuthentication(
    request: Request,
    securityName: string,
    _scopes?: string[]
): Promise<unknown> {
    if (securityName === 'bearerAuth') {
        return new Promise((resolve, reject) => {
            const authHeader = request.headers.authorization
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return reject({ status: 401, message: 'unauthorized' })
            }
            const token = authHeader.split(' ')[1]
            if (!token) {
                return reject({ status: 401, message: 'Token missing' })
            }
            const secret = process.env.JWT_SECRET
            if (!secret) {
                return reject({ status: 500, message: 'JWT secret is not configured' })
            }
            try {
                const decoded = jwt.verify(token, secret) as {
                    id: number
                    username: string
                    email: string
                    accountType: 'staff' | 'user'
                }
                request.user = {
                    id: decoded.id,
                    username: decoded.username,
                    email: decoded.email,
                    accountType: decoded.accountType,
                }
                resolve(decoded)
            } catch {
                reject({ status: 401, message: 'Invalid or expired token' })
            }
        })
    }
    return Promise.reject({ status: 401, message: 'Unknown security scheme' })
}
