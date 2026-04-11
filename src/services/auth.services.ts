import bcrypt from 'bcrypt'
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken'
import { StaffRepository } from '../repository/staff.repository.js'
import { CustomerRepository } from '../repository/customer.repository.js'
import type { LoginData } from '../types/staff.types.js'
import "dotenv/config";

const staffRepository = new StaffRepository()
const customerRepository = new CustomerRepository()

export class AuthService {
    async login(data: LoginData) {
        const { username, password } = data
        if (!username || !password) {
            throw new Error('Username and password are required')
        }
        const staff = await staffRepository.findAuthByUsername(username)
        if (!staff) {
            throw new Error('Invalid username or password')
        }
        if (staff.status !== 'active') {
            throw new Error('Staff is inactive')
        }
        const isMatch = await bcrypt.compare(password, staff.password_hash)
        if (!isMatch) {
            throw new Error('Invalid username or passowrd')
        }
        const secret: Secret = process.env.JWT_SECRET as string
        const expiresIn: SignOptions['expiresIn'] = '1d'
        if (!secret) {
            throw new Error('JWT_SECRECT is not configured')
        }
        const token = jwt.sign(
            {
              id: staff.id,
              username: staff.username,
              email: staff.email,
              accountType: 'staff'
            },
            secret,
            {expiresIn}
          )
          return {
            token,
            staff: {
                id: staff.id,
                username: staff.username,
                first_name: staff.first_name,
                last_name: staff.last_name,
                email: staff.email,
                phone: staff.phone,
                address: staff.address,
                status: staff.status
            }
          }
    }

    async loginCustomer(data: LoginData) {
        const { username, password } = data
        if (!username || !password) {
            throw new Error('Username and password are required')
        }

        const customer = await customerRepository.findAuthByUsername(username)
        if (!customer) {
            throw new Error('Invalid username or password')
        }
        if (customer.status !== 'active') {
            throw new Error('Customer account is inactive')
        }

        const isMatch = await bcrypt.compare(password, customer.password_hash as string)
        if (!isMatch) {
            throw new Error('Invalid username or password')
        }

        const secret: Secret = process.env.JWT_SECRET as string
        if (!secret) {
            throw new Error('JWT_SECRET is not configured')
        }

        const expiresIn: SignOptions['expiresIn'] = '1d'
        const token = jwt.sign(
            {
                id: customer.id,
                username: customer.username,
                email: customer.email,
                accountType: 'user',
            },
            secret,
            { expiresIn }
        )

        return {
            token,
            customer: {
                id:         customer.id,
                username:   customer.username,
                first_name: customer.first_name,
                last_name:  customer.last_name,
                email:      customer.email,
                phone:      customer.phone,
                address:    customer.address,
                status:     customer.status,
            },
        }
    }

    async logout () {
        return {
            message: 'logout successfully'
        }
    }
}