import { CategoryRepository } from '../repository/category.repository.js'
import type { CreateCategoryData, UpdateCategoryData } from '../types/category.types.js'

export class CategoryServices {
    private categoryRepository = new CategoryRepository()

    async getAllCategories(page: number, limit: number) {
        const [categories, total] = await Promise.all([
            this.categoryRepository.findAllPaginated(page, limit),
            this.categoryRepository.countCategories(),
        ])
        return {
            categories,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        }
    }

    async getCategoryById(id: number) {
        const category = await this.categoryRepository.findById(id)
        if (!category) {
            throw new Error('Category not found')
        }
        return category
    }

    async createCategory(data: CreateCategoryData) {
        if (!data.name) {
            throw new Error('Category name is required')
        }
        const categoryId = await this.categoryRepository.createCategory(data)
        return { categoryId, name: data.name }
    }

    async updateCategory(id: number, data: UpdateCategoryData): Promise<boolean> {
        const category = await this.categoryRepository.findById(id)
        if (!category) {
            throw new Error('Category not found')
        }

        const hasData =
            data.name !== undefined ||
            data.description !== undefined ||
            data.status !== undefined

        if (!hasData) {
            throw new Error('No data to update')
        }

        if (data.name !== undefined) {
            const existing = await this.categoryRepository.findByName(data.name)
            if (existing && existing.id !== id) {
                throw new Error(`Category with name '${data.name}' already exists`)
            }
        }

        return this.categoryRepository.updateCategory(id, data)
    }

    async deleteCategory(id: number): Promise<boolean> {
        const category = await this.categoryRepository.findById(id)
        if (!category) {
            throw new Error('Category not found')
        }
        return this.categoryRepository.deleteCategory(id)
    }
    async restoreCategory(id: number): Promise<boolean> {
        const category = await this.categoryRepository.findDeleteById(id)
        if (!category) {
            throw new Error('Category not found or not deleted')
        }
        return this.categoryRepository.restoreCategory(id)
    }
}
