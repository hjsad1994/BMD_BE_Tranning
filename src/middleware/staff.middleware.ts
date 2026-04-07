import type { Request, Response, NextFunction } from "express";
import "dotenv/config";
export function initStaffGuard(req: Request, res: Response, next: NextFunction) {
    if(process.env.ALLOW_INIT_STAFF !== 'true') {
        return res.status(403).json({
            message: 'Init staff is disable'
        })
    }
    const secret = req.headers['x-init-secret']
    if (!secret || secret !== process.env.INIT_STAFF_SECRET) {
        return res.status(403).json({
            message: 'Forbidden'
        })
    }
    next();
}