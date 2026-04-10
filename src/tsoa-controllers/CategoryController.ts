import {
    Body,
    Controller,
    Delete,
    Get,
    Post,
    Put,
    Query,
    Route,
    Security,
    Tags,
} from 'tsoa'
import type { Request as ExpressRequest, Response } from 'express'
import { CategoryServices } from '../services/category.services.js'

interface CreateCategoryBody {
    /** @example "Apple" */
    name: string
    /** @example "Apple test" */
    description?: string
}

interface UpdateCategoryBody {
    /** @example "Apple Updated" */
    name?: string
    /** @example "Apple test updated" */
    description?: string
    /** @example "active" */
    status?: 'active' | 'inactive'
}

const categoryService = new CategoryServices()

@Route('api/admin/categories')
@Tags('Categories')
@Security('bearerAuth')
export class CategoryController extends Controller {
    /** @summary Get all categories */
    @Get()
    async getAllCategories(): Promise<unknown> {
        try {
            const result = await categoryService.getAllCategories()
            return { success: true, data: result, message: 'Get categories successfully' }
        } catch (error) {
            this.setStatus(500)
            return { success: false, message: error instanceof Error ? error.message : 'Server error' }
        }
    }

    /** @summary Get a category by ID */
    @Get('detail')
    async getCategoryById(/** @example 1 */ @Query() id: number): Promise<unknown> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid category id' }
        }
        try {
            const result = await categoryService.getCategoryById(id)
            return { success: true, data: result, message: 'Get category successfully' }
        } catch (error) {
            this.setStatus(404)
            return { success: false, message: error instanceof Error ? error.message : 'Category not found' }
        }
    }

    /** @summary Create a new category */
    @Post()
    async createCategory(@Body() body: CreateCategoryBody): Promise<unknown> {
        try {
            const result = await categoryService.createCategory(body)
            this.setStatus(201)
            return { success: true, data: result, message: 'Category created successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Create category failed' }
        }
    }

    /** @summary Update a category */
    @Put()
    async updateCategory(
        /** @example 1 */ @Query() id: number,
        @Body() body: UpdateCategoryBody
    ): Promise<unknown> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid category id' }
        }
        if (!body || Object.keys(body).length === 0) {
            this.setStatus(400)
            return { success: false, message: 'Request body is empty' }
        }
        try {
            const result = await categoryService.updateCategory(id, body)
            return { success: true, data: result, message: 'Category updated successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Update category failed' }
        }
    }

    /** @summary Delete a category */
    @Delete()
    async deleteCategory(/** @example 1 */ @Query() id: number): Promise<unknown> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid category id' }
        }
        try {
            await categoryService.deleteCategory(id)
            return { success: true, message: 'Category deleted successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Delete category failed' }
        }
    }

    /** @summary Restore a deleted category */
    @Put('restore')
    async restoreCategory(/** @example 1 */ @Query() id: number): Promise<unknown> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid category id' }
        }
        try {
            await categoryService.restoreCategory(id)
            return { success: true, message: 'Category restored successfully' }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Restore category failed'
            const status = message === 'Category not found or not deleted' ? 404 : 400
            this.setStatus(status)
            return { success: false, message }
        }
    }

    // ── Express-compatible handlers used by routes ──────────────────────────

    async getAllCategoriesHandler(_req: ExpressRequest, res: Response) {
        try {
            const result = await categoryService.getAllCategories()
            return res.status(200).json({ success: true, data: result, message: 'Get categories successfully' })
        } catch (error) {
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' })
        }
    }

    async getCategoryByIdHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.query.id)
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid category id' })
        }
        try {
            const result = await categoryService.getCategoryById(id)
            return res.status(200).json({ success: true, data: result, message: 'Get category successfully' })
        } catch (error) {
            return res.status(404).json({ success: false, message: error instanceof Error ? error.message : 'Category not found' })
        }
    }

    async createCategoryHandler(req: ExpressRequest, res: Response) {
        try {
            const result = await categoryService.createCategory(req.body)
            return res.status(201).json({ success: true, data: result, message: 'Category created successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Create category failed' })
        }
    }

    async updateCategoryHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.query.id)
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid category id' })
        }
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: 'Request body is empty' })
        }
        try {
            await categoryService.updateCategory(id, req.body)
            return res.status(200).json({ success: true, message: 'Category updated successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Update category failed' })
        }
    }

    async deleteCategoryHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.query.id)
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid category id' })
        }
        try {
            await categoryService.deleteCategory(id)
            return res.status(200).json({ success: true, message: 'Category deleted successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Delete category failed' })
        }
    }

    async restoreCategoryHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.query.id)
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid category id' })
        }
        try {
            await categoryService.restoreCategory(id)
            return res.status(200).json({ success: true, message: 'Category restored successfully' })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Restore category failed'
            const status = message === 'Category not found or not deleted' ? 404 : 400
            return res.status(status).json({ success: false, message })
        }
    }
}
