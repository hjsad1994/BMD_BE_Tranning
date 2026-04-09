import { ProductRepository } from '../repository/product.repository.js'
import { CategoryRepository } from '../repository/category.repository.js'
import type { CreateProductData, UpdateProductData } from '../types/product.types.js'

export class ProductServices {
    private productRepository = new ProductRepository()
    private categoryRepository = new CategoryRepository()

    async getAllProducts() {
        return await this.productRepository.findAll()
    }

    async getProductById(id: number) {
        const product = await this.productRepository.findById(id)
        if (!product) {
            throw new Error('Product not found')
        }
        return product
    }

    async getProductsByCategory(categoryId: number) {
        const category = await this.categoryRepository.findById(categoryId)
        if (!category) {
            throw new Error('Category not found')
        }
        return await this.productRepository.findByCategoryId(categoryId)
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
            data.name !== undefined ||
            data.description !== undefined ||
            data.price !== undefined ||
            data.stock !== undefined ||
            data.image_url !== undefined ||
            data.status !== undefined

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
