import { CustomerRepository } from './../repository/customer.repository.js';
import bcrypt from 'bcrypt'
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken'
import { StaffRepository } from '../repository/staff.repository.js'
import type { CreateCustomerData } from '../types/customer.types.js'


// const { username, first_name, last_name, email, password } = data

export class CustomerServices {
    private customerRepository = new CustomerRepository()
    
    async createCustomer(data: CreateCustomerData) {
        const password_hash = await bcrypt.hash(data.password, 10)
        const customerId = await this.customerRepository.createCustomer({
            ...data,
            password: password_hash,
            status: 'active'
        })
        return { id: customerId, username: data.username, email: data.email }
    }
}