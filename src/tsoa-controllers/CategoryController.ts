import {
    Body,
    Controller,
    Delete,
    Get,
    Path,
    Post,
    Put,
    Query,
    Route,
    Security,
    Tags,
} from 'tsoa'
import type { Request as ExpressRequest, Response } from 'express'
import { CategoryServices } from '../services/category.services.js'
import type {
    ApiResponse,
    ApiMessageResponse,
    ApiErrorResponse,
    CategoryResponse,
    CategoryListResponse,
    CreatedCategoryResponse,
} from '../types/api-response.types.js'

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
@Tags('Admin - Categories')
@Security('bearerAuth')
export class CategoryController extends Controller {
    /** @summary Get all categories */
    @Get()
    async getAllCategories(
        /** @example 1 */  @Query() page: number = 1,
        /** @example 20 */ @Query() limit: number = 20
    ): Promise<ApiResponse<CategoryListResponse> | ApiErrorResponse> {
        if (page < 1 || !Number.isInteger(Number(page))) {
            this.setStatus(400)
            return { success: false, message: 'page must be a positive integer >= 1' }
        }
        if (limit < 1 || limit > 100) {
            this.setStatus(400)
            return { success: false, message: 'limit must be between 1 and 100' }
        }
        try {
            const result = await categoryService.getAllCategories(Number(page), Number(limit))
            return { success: true, data: result as CategoryListResponse, message: 'Get categories successfully' }
        } catch (error) {
            this.setStatus(500)
            return { success: false, message: error instanceof Error ? error.message : 'Server error' }
        }
    }

    /** @summary Get a category by ID */
    @Get('{categoryId}')
    async getCategoryById(
        /** @example 1 */ @Path() categoryId: number
    ): Promise<ApiResponse<CategoryResponse> | ApiErrorResponse> {
        if (!categoryId || Number.isNaN(categoryId)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid category id' }
        }
        try {
            const result = await categoryService.getCategoryById(categoryId)
            return { success: true, data: result as CategoryResponse, message: 'Get category successfully' }
        } catch (error) {
            this.setStatus(404)
            return { success: false, message: error instanceof Error ? error.message : 'Category not found' }
        }
    }

    /** @summary Create a new category */
    @Post()
    async createCategory(
        @Body() body: CreateCategoryBody
    ): Promise<ApiResponse<CreatedCategoryResponse> | ApiErrorResponse> {
        try {
            const result = await categoryService.createCategory(body)
            this.setStatus(201)
            return { success: true, data: result as CreatedCategoryResponse, message: 'Category created successfully' }
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
    ): Promise<ApiMessageResponse | ApiErrorResponse> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid category id' }
        }
        if (!body || Object.keys(body).length === 0) {
            this.setStatus(400)
            return { success: false, message: 'Request body is empty' }
        }
        try {
            await categoryService.updateCategory(id, body)
            return { success: true, message: 'Category updated successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Update category failed' }
        }
    }

    /** @summary Delete a category */
    @Delete()
    async deleteCategory(
        /** @example 1 */ @Query() id: number
    ): Promise<ApiMessageResponse | ApiErrorResponse> {
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
    async restoreCategory(
        /** @example 1 */ @Query() id: number
    ): Promise<ApiMessageResponse | ApiErrorResponse> {
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

    // ── Express handlers ──────────────────────────────────────────────────────

    async getAllCategoriesHandler(req: ExpressRequest, res: Response) {
        const page  = Number(req.query.page)  || 1
        const limit = Number(req.query.limit) || 20
        if (page < 1) {
            return res.status(400).json({ success: false, message: 'page must be >= 1' })
        }
        if (limit < 1 || limit > 100) {
            return res.status(400).json({ success: false, message: 'limit must be between 1 and 100' })
        }
        try {
            const result = await categoryService.getAllCategories(page, limit)
            return res.status(200).json({ success: true, data: result, message: 'Get categories successfully' })
        } catch (error) {
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' })
        }
    }

    async getCategoryByIdHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.params.categoryId)
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
