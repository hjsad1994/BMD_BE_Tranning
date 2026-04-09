import type { Request, Response } from 'express'
import { CategoryServices } from '../services/category.services.js'

const categoryService = new CategoryServices()

export class CategoryController {

    async getAllCategories(_req: Request, res: Response) {
        try {
            const result = await categoryService.getAllCategories()
            return res.status(200).json({
                success: true,
                data: result,
                message: 'Get categories successfully'
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Server error'
            })
        }
    }

    async getCategoryById(req: Request, res: Response) {
        try {
            const id = Number(req.params.id)

            if (!id || Number.isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category id'
                })
            }

            const result = await categoryService.getCategoryById(id)
            return res.status(200).json({
                success: true,
                data: result,
                message: 'Get category successfully'
            })
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : 'Category not found'
            })
        }
    }

    async createCategory(req: Request, res: Response) {
        try {
            const result = await categoryService.createCategory(req.body)
            return res.status(201).json({
                success: true,
                data: result,
                message: 'Category created successfully'
            })
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Create category failed'
            })
        }
    }

    async updateCategory(req: Request, res: Response) {
        try {
            const id = Number(req.params.id)

            if (!id || Number.isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category id'
                })
            }

            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Request body is empty'
                })
            }

            await categoryService.updateCategory(id, req.body)
            return res.status(200).json({
                success: true,
                message: 'Category updated successfully'
            })
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Update category failed'
            })
        }
    }

    async deleteCategory(req: Request, res: Response) {
        try {
            const id = Number(req.params.id)

            if (!id || Number.isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category id'
                })
            }

            await categoryService.deleteCategory(id)
            return res.status(200).json({
                success: true,
                message: 'Category deleted successfully'
            })
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Delete category failed'
            })
        }
    }
    async restoreCategory(req: Request, res: Response) {
        try {
            const id = Number(req.params.id)

            if (!id || Number.isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category id'
                })
            }

            await categoryService.restoreCategory(id)
            return res.status(200).json({
                success: true,
                message: 'Category restored successfully'
            })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Restore category failed'
            const status = message === 'Category not found or not deleted' ? 404 : 400
            return res.status(status).json({
                success: false,
                message
            })
        }
    }
}
