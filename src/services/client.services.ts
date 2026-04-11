import bcrypt from 'bcrypt'
import { CustomerRepository } from '../repository/customer.repository.js'
import type { UpdateCustomerData } from '../types/customer.types.js'

export class ClientService {
    private customerRepository = new CustomerRepository()

    // GET: return profile of the logged-in customer
    async getProfile(customerId: number) {
        const customer = await this.customerRepository.findById(customerId)
        if (!customer) {
            throw new Error('Customer not found')
        }
        return customer
    }

    // PUT: update own profile (email uniqueness check included)
    async updateProfile(customerId: number, data: UpdateCustomerData): Promise<boolean> {
        const customer = await this.customerRepository.findById(customerId)
        if (!customer) {
            throw new Error('Customer not found')
        }

        if (data.email !== undefined) {
            const existing = await this.customerRepository.findByEmail(data.email)
            if (existing && existing.id !== customerId) {
                throw new Error('Email is already in use by another account')
            }
        }

        return this.customerRepository.updateCustomer(customerId, data)
    }

    // PUT: change own password — verify current password before setting new one
    async changePassword(
        customerId: number,
        currentPassword: string,
        newPassword: string
    ): Promise<boolean> {
        const profile = await this.customerRepository.findById(customerId)
        if (!profile) {
            throw new Error('Customer not found')
        }

        const customer = await this.customerRepository.findAuthByUsername(profile.username)
        if (!customer) {
            throw new Error('Customer not found')
        }

        const isMatch = await bcrypt.compare(currentPassword, customer.password_hash as string)
        if (!isMatch) {
            throw new Error('Current password is incorrect')
        }

        const newHash = await bcrypt.hash(newPassword, 10)
        return this.customerRepository.updatePasswordHash(customerId, newHash)
    }

    // DELETE: soft-delete own account
    async deleteAccount(customerId: number): Promise<boolean> {
        const customer = await this.customerRepository.findById(customerId)
        if (!customer) {
            throw new Error('Customer not found')
        }
        return this.customerRepository.deleteCustomer(customerId)
    }
}
