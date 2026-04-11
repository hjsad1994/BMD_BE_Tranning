import { ProductRepository } from '../repository/product.repository.js'
import { CategoryRepository } from '../repository/category.repository.js'
import type { CreateProductData, UpdateProductData, ProductWithCategoryRow, ProductResponse } from '../types/product.types.js'

export class ProductServices {
    private productRepository = new ProductRepository()
    private categoryRepository = new CategoryRepository()

    private formatProduct(row: ProductWithCategoryRow): ProductResponse {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            price: row.price,
            image_url: row.image_url,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
            category: row.cat_id !== null ? {
                id: row.cat_id,
                name: row.cat_name!,
                description: row.cat_description,
                status: row.cat_status!,
            } : null,
        }
    }

    async getAllProducts(page: number, limit: number) {
        const [rows, total] = await Promise.all([
            this.productRepository.findAllPaginated(page, limit),
            this.productRepository.countProducts()
        ])
        return { 
            products: rows.map(row => this.formatProduct(row)),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total/limit)
            }
        }
    }

    async getProductById(id: number) {
        const row = await this.productRepository.findWithCategoryById(id)
        if (!row) {
            throw new Error('Product not found')
        }
        return this.formatProduct(row)
    }

    async getProductsByCategory(categoryId: number) {
        const category = await this.categoryRepository.findById(categoryId)
        if (!category) {
            throw new Error('Category not found')
        }
        const rows = await this.productRepository.findByCategoryId(categoryId)
        return rows.map(row => this.formatProduct(row))
    }

    async createProduct(data: CreateProductData) {
        if (!data.name) {
            throw new Error('Product name is required')
        }

        if (data.category_id !== undefined) {
            const category = await this.categoryRepository.findById(data.category_id)
            if (!category) {
                throw new Error('Category not found')
            }
        }

        const productId = await this.productRepository.createProduct(data)
        return { productId, name: data.name }
    }

    async updateProduct(id: number, data: UpdateProductData): Promise<boolean> {
        const product = await this.productRepository.findById(id)
        if (!product) {
            throw new Error('Product not found')
        }

        const hasData =
            data.category_id !== undefined ||
            data.name        !== undefined ||
            data.description !== undefined ||
            data.price       !== undefined ||
            data.image_url   !== undefined ||
            data.status      !== undefined

        if (!hasData) {
            throw new Error('No data to update')
        }

        if (data.category_id !== undefined) {
            const category = await this.categoryRepository.findById(data.category_id)
            if (!category) {
                throw new Error('Category not found')
            }
        }

        return this.productRepository.updateProduct(id, data)
    }

    async deleteProduct(id: number): Promise<boolean> {
        const product = await this.productRepository.findById(id)
        if (!product) {
            throw new Error('Product not found')
        }
        return this.productRepository.deleteProduct(id)
    }
    async restoreProduct(id: number): Promise<boolean> {
        const product = await this.productRepository.findDeleteById(id)
        if (!product) {
            throw new Error('Product not found or not deleted')
        }
        return this.productRepository.restoreProduct(id)
    }
}
