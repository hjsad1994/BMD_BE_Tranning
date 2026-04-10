import type { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const UPLOAD_DIR = 'uploads/products'

// Create upload folder if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

// Save file to disk (not memory)
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, UPLOAD_DIR)
    },
    filename(req, file, cb) {
        const ext = path.extname(file.originalname)
        // Use timestamp to avoid duplicate filenames
        cb(null, `product-${Date.now()}${ext}`)
    }
})

// Only allow image file types
function fileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (allowed.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WEBP)'))
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})

export function uploadImage(req: Request, res: Response, next: NextFunction) {
    // Accept single file from field named "image"
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Multer errors: file too large, wrong field name, etc.
            return res.status(400).json({ success: false, message: err.message })
        }
        if (err) {
            // Custom errors: invalid file type from fileFilter
            return res.status(400).json({ success: false, message: err.message })
        }
        // File saved successfully, req.file is now available
        next()
    })
}
