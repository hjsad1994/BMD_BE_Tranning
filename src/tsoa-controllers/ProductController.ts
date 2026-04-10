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
    UploadedFile,
} from 'tsoa'
import type { Request as ExpressRequest, Response } from 'express'
import { ProductServices } from '../services/product.services.js'

interface CreateProductBody {
    /** @example 1 */
    category_id?: number
    /** @example "iPhone 15" */
    name: string
    /** @example "test test test" */
    description?: string
    /** @example 999.99 */
    price: number
    /** @example "https://example.com/iphone.png" */
    image_url?: string
}

interface UpdateProductBody {
    /** @example 2 */
    category_id?: number
    /** @example "iPhone" */
    name?: string
    /** @example "updated test test etst" */
    description?: string
    /** @example 1199.99 */
    price?: number
    /** @example "https://example.com/1.png" */
    image_url?: string
    /** @example "active" */
    status?: 'active' | 'inactive'
}

const productService = new ProductServices()

@Route('api/admin/products')
@Tags('Products')
@Security('bearerAuth')
export class ProductController extends Controller {
    /** @summary Get all products */
    @Get()
    async getAllProducts(): Promise<unknown> {
        try {
            const result = await productService.getAllProducts()
            return { success: true, data: result, message: 'Get products successfully' }
        } catch (error) {
            this.setStatus(500)
            return { success: false, message: error instanceof Error ? error.message : 'Server error' }
        }
    }

    /** @summary Get products by category */
    @Get('category')
    async getProductsByCategory(/** @example 1 */ @Query() id: number): Promise<unknown> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid category id' }
        }
        try {
            const result = await productService.getProductsByCategory(id)
            return { success: true, data: result, message: 'Get products by category successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Category not found' }
        }
    }

    /** @summary Get a product by ID */
    @Get('detail')
    async getProductById(/** @example 1 */ @Query() id: number): Promise<unknown> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid product id' }
        }
        try {
            const result = await productService.getProductById(id)
            return { success: true, data: result, message: 'Get product successfully' }
        } catch (error) {
            this.setStatus(404)
            return { success: false, message: error instanceof Error ? error.message : 'Product not found' }
        }
    }

    /** @summary Create a new product */
    @Post()
    async createProduct(@Body() body: CreateProductBody): Promise<unknown> {
        try {
            const result = await productService.createProduct(body)
            this.setStatus(201)
            return { success: true, data: result, message: 'Product created successfully' }
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
    ): Promise<unknown> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid product id' }
        }
        if (!body || Object.keys(body).length === 0) {
            this.setStatus(400)
            return { success: false, message: 'Request body is empty' }
        }
        try {
            const result = await productService.updateProduct(id, body)
            return { success: true, data: result, message: 'Product updated successfully' }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Update product failed' }
        }
    }

    /** @summary Delete a product */
    @Delete()
    async deleteProduct(/** @example 1 */ @Query() id: number): Promise<unknown> {
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
    async restoreProduct(/** @example 1 */ @Query() id: number): Promise<unknown> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid product id' }
        }
        try {
            await productService.restoreProduct(id)
            return { success: true, message: 'Product restored successfully' }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Restore product failed'
            const status = message === 'Product not found or not deleted' ? 404 : 400
            this.setStatus(status)
            return { success: false, message }
        }
    }

    /** @summary Upload product image */
    @Post('upload-image')
    async uploadProductImage(
        /** @example 1 */ @Query() id: number,
        @UploadedFile() image: Express.Multer.File
    ): Promise<unknown> {
        if (!id || Number.isNaN(id)) {
            this.setStatus(400)
            return { success: false, message: 'Invalid product id' }
        }
        if (!image) {
            this.setStatus(400)
            return { success: false, message: 'No image file provided' }
        }
        try {
            const image_url = `/uploads/products/${image.filename}`
            await productService.updateProduct(id, { image_url })
            return { success: true, message: 'Product image uploaded successfully', data: { image_url } }
        } catch (error) {
            this.setStatus(400)
            return { success: false, message: error instanceof Error ? error.message : 'Upload image failed' }
        }
    }

    // ── Express-compatible handlers used by routes ──────────────────────────

    async getAllProductsHandler(_req: ExpressRequest, res: Response) {
        try {
            const result = await productService.getAllProducts()
            return res.status(200).json({ success: true, data: result, message: 'Get products successfully' })
        } catch (error) {
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' })
        }
    }

    async getProductByIdHandler(req: ExpressRequest, res: Response) {
        const id = Number(req.query.id)
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
        const categoryId = Number(req.query.id)
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
            return res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Update product image failed' })
        }
    }
}
