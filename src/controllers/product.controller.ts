import type { Request, Response } from 'express'
import { ProductServices } from '../services/product.services.js'

const productService = new ProductServices()

export class ProductController {

    async getAllProducts(_req: Request, res: Response) {
        try {
            const result = await productService.getAllProducts()
            return res.status(200).json({
                success: true,
                data: result,
                message: 'Get products successfully'
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Server error'
            })
        }
    }

    async getProductById(req: Request, res: Response) {
        try {
            const id = Number(req.query.id)

            if (!id || Number.isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product id'
                })
            }

            const result = await productService.getProductById(id)
            return res.status(200).json({
                success: true,
                data: result,
                message: 'Get product successfully'
            })
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : 'Product not found'
            })
        }
    }

    async getProductsByCategory(req: Request, res: Response) {
        try {
            const categoryId = Number(req.query.id)

            if (!categoryId || Number.isNaN(categoryId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category id'
                })
            }

            const result = await productService.getProductsByCategory(categoryId)
            return res.status(200).json({
                success: true,
                data: result,
                message: 'Get products by category successfully'
            })
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Get products by category failed'
            })
        }
    }

    async createProduct(req: Request, res: Response) {
        try {
            const result = await productService.createProduct(req.body)
            return res.status(201).json({
                success: true,
                data: result,
                message: 'Product created successfully'
            })
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Create product failed'
            })
        }
    }

    async updateProduct(req: Request, res: Response) {
        try {
            const id = Number(req.query.id)

            if (!id || Number.isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product id'
                })
            }

            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Request body is empty'
                })
            }

            await productService.updateProduct(id, req.body)
            return res.status(200).json({
                success: true,
                message: 'Product updated successfully'
            })
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Update product failed'
            })
        }
    }

    async deleteProduct(req: Request, res: Response) {
        try {
            const id = Number(req.query.id)

            if (!id || Number.isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product id'
                })
            }

            await productService.deleteProduct(id)
            return res.status(200).json({
                success: true,
                message: 'Product deleted successfully'
            })
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Delete product failed'
            })
        }
    }
    async restoreProduct(req: Request, res: Response) {
        try {
            const id = Number(req.query.id)

            if (!id || Number.isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product id'
                })
            }

            await productService.restoreProduct(id)
            return res.status(200).json({
                success: true,
                message: 'Product restored successfully'
            })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Restore product failed'
            const status = message === 'Product not found or not deleted' ? 404 : 400
            return res.status(status).json({
                success: false,
                message
            })
        }
    }
}
