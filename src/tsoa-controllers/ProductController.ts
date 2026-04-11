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
    // UploadedFile, // temporarily commented out (upload image via Swagger not yet configured)
} from 'tsoa'
import type { Request as ExpressRequest, Response } from 'express'
import { ProductServices } from '../services/product.services.js'
import type {
    ApiResponse,
    ApiMessageResponse,
    ApiErrorResponse,
    ProductResponse,
    ImageUrlResponse,
    CreatedProductResponse,
    ProductListResponse
} from '../types/api-response.types.js'

interface CreateProductBody {
    /** @example 1 */
    category_id?: number
    /** @example "iPhone 15" */
    name: string
    /** @example "Latest Apple smartphone" */
    description?: string
    /** @example 999.99 */
    price: number
    /** @example "https://example.com/iphone.png" */
    image_url?: string
}

interface UpdateProductBody {
    /** @example 2 */
    category_id?: number
    /** @example "iPhone 15 Pro" */
    name?: string
    /** @example "Updated description" */
    description?: string
    /** @example 1199.99 */
    price?: number
    /** @example "https://example.com/new.png" */
    image_url?: string
    /** @example "active" */
    status?: 'active' | 'inactive'
}

const productService = new ProductServices()

@Route('api/admin/products')
@Tags('Admin - Products')
@Security('bearerAuth')
export class ProductController extends Controller {
    /** @summary Get all products */
    @Get()
    async getAllProducts(
        /** @example 1 */  @Query() page: number = 1,
        /** @example 20 */ @Query() limit: number = 20
    ): Promise<ApiResponse<ProductListResponse> | ApiErrorResponse> {
        if (page < 1 || !Number.isInteger(Number(page))) {
            this.setStatus(400)
            return { success: false, message: 'page must be a positive integer >= 1' }
        }
        if (limit < 1 || limit > 100) {
            this.setStatus(400)
            return { success: false, message: 'limit must be between 1 and 100' }
        }
        try {
            const result = await productService.getAllProducts(Number(page), Number(limit))
            return { success: true, data: result as ProductListResponse, message: 'Get products successfully' }
        } catch (error) {
            this.setStatus(500)
            return { success: false, message: error instanceof Error ? error.message : 'Server error' }
        }
    }

    /** @summary Get products by category */
    @Get('category')
    async getProductsByCategory(
        /** @example 1 */ @Query() categoryId: number
    ): Promise<ApiResponse<ProductResponse[]> | ApiErrorResponse> {
        if (!categoryId || Number.isNaN(categoryId)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid category id' }
        }
        try {
            const result = await productService.getProductsByCategory(categoryId)
            return { success: true, data: result as unknown as ProductResponse[], message: 'Get products by category successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Category not found' }
        }
    }

    /** @summary Get a product by ID */
    @Get('{productId}')
    async getProductById(
        /** @example 1 */ @Path() productId: number
    ): Promise<ApiResponse<ProductResponse> | ApiErrorResponse> {
        if (!productId || Number.isNaN(productId)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid product id' }
        }
        try {
            const result = await productService.getProductById(productId)
            return { success: true, data: result as unknown as ProductResponse, message: 'Get product successfully' }
        } catch (error) {
            this.setStatus(404)
            return { success: false, message: error instanceof Error ? error.message : 'Product not found' }
        }
    }

    /** @summary Create a new product */
    @Post()
    async createProduct(
        @Body() body: CreateProductBody
    ): Promise<ApiResponse<CreatedProductResponse> | ApiErrorResponse> {
        try {
            const result = await productService.createProduct(body)
            this.setStatus(201)
            return { success: true, data: result as CreatedProductResponse, message: 'Product created successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Create product failed' }
        }
    }

    /** @summary Update a product */
    @Put()
    async updateProduct(
        /** @example 1 */ @Query() id: number,
        @Body() body: UpdateProductBody
    ): Promise<ApiMessageResponse | ApiErrorResponse> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid product id' }
        }
        if (!body || Object.keys(body).length === 0) {
            this.setStatus(400)
            return { success: false, message: 'Request body is empty' }
        }
        try {
            await productService.updateProduct(id, body)
            return { success: true, message: 'Product updated successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Update product failed' }
        }
    }

    /** @summary Delete a product */
    @Delete()
    async deleteProduct(
        /** @example 1 */ @Query() id: number
    ): Promise<ApiMessageResponse | ApiErrorResponse> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid product id' }
        }
        try {
            await productService.deleteProduct(id)
            return { success: true, message: 'Product deleted successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Delete product failed' }
        }
    }

    /** @summary Restore a deleted product */
    @Put('restore')
    async restoreProduct(
        /** @example 1 */ @Query() id: number
    ): Promise<ApiMessageResponse | ApiErrorResponse> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid product id' }
        }
        try {
            await productService.restoreProduct(id)
            return { success: true, message: 'Product restored successfully' }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Restore product failed'
            this.setStatus(message === 'Product not found or not deleted' ? 404 : 400)
            return { success: false, message }
        }
    }

    // /** @summary Upload product image */
    // @Post('upload-image')
    // async uploadProductImage(
    //     /** @example 1 */ @Query() id: number,
    //     @UploadedFile() image: Express.Multer.File
    // ): Promise<ApiResponse<ImageUrlResponse> | ApiErrorResponse> {
    //     if (!id || Number.isNaN(id)) {
    //         this.setStatus(400)
    //         return { success: false, message: 'Invalid product id' }
    //     }
    //     if (!image) {
    //         this.setStatus(400)
    //         return { success: false, message: 'No image file provided' }
    //     }
    //     try {
    //         const image_url = `/uploads/products/${image.filename}`
    //         await productService.updateProduct(id, { image_url })
    //         return { success: true, message: 'Product image uploaded successfully', data: { image_url } }
    //     } catch (error) {
    //         this.setStatus(400)
    //         return { success: false, message: error instanceof Error ? error.message : 'Upload image failed' }
    //     }
    // }

    // ── Express handlers ──────────────────────────────────────────────────────

    async getAllProductsHandler(req: ExpressRequest, res: Response) {
        const page  = Number(req.query.page)  || 1
        const limit = Number(req.query.limit) || 20
        if (page < 1) {
            return res.status(400).json({ success: false, message: 'page must be >= 1' })
        }
        if (limit < 1 || limit > 100) {
            return res.status(400).json({ success: false, message: 'limit must be between 1 and 100' })
        }
        try {
            const result = await productService.getAllProducts(page, limit)
            return res.status(200).json({ success: true, data: result, message: 'Get products successfully' })
        } catch (error) {
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' })
        }
    }

    async getProductByIdHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.params.productId)
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid product id' })
        }
        try {
            const result = await productService.getProductById(id)
            return res.status(200).json({ success: true, data: result, message: 'Get product successfully' })
        } catch (error) {
            return res.status(404).json({ success: false, message: error instanceof Error ? error.message : 'Product not found' })
        }
    }

    async getProductsByCategoryHandler(req: ExpressRequest, res: Response) {
        const categoryId = Number(req.query.categoryId)
        if (!categoryId || Number.isNaN(categoryId)) {
            return res.status(400).json({ success: false, message: 'Invalid category id' })
        }
        try {
            const result = await productService.getProductsByCategory(categoryId)
            return res.status(200).json({ success: true, data: result, message: 'Get products by category successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Get products by category failed' })
        }
    }

    async createProductHandler(req: ExpressRequest, res: Response) {
        try {
            const result = await productService.createProduct(req.body)
            return res.status(201).json({ success: true, data: result, message: 'Product created successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Create product failed' })
        }
    }

    async updateProductHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.query.id)
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid product id' })
        }
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: 'Request body is empty' })
        }
        try {
            await productService.updateProduct(id, req.body)
            return res.status(200).json({ success: true, message: 'Product updated successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Update product failed' })
        }
    }

    async deleteProductHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.query.id)
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid product id' })
        }
        try {
            await productService.deleteProduct(id)
            return res.status(200).json({ success: true, message: 'Product deleted successfully' })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Delete product failed' })
        }
    }

    async restoreProductHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.query.id)
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid product id' })
        }
        try {
            await productService.restoreProduct(id)
            return res.status(200).json({ success: true, message: 'Product restored successfully' })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Restore product failed'
            const status = message === 'Product not found or not deleted' ? 404 : 400
            return res.status(status).json({ success: false, message })
        }
    }

    async uploadProductImageHandler(req: ExpressRequest, res: Response) {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' })
        }
        const productId = Number(req.query.id)
        if (!productId || Number.isNaN(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product id' })
        }
        try {
            const imageUrl = `/uploads/products/${req.file.filename}`
            await productService.updateProduct(productId, { image_url: imageUrl })
            return res.status(200).json({ success: true, message: 'Product image uploaded successfully', data: { image_url: imageUrl } })
        } catch (error) {
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Upload image failed' })
        }
    }
}
