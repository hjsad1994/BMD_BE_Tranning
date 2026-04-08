import bcrypt from 'bcrypt'
import { StaffRepository } from '../repository/staff.repository.js'
import type { InitStaffData, UpdateProfileData } from '../types/staff.types.js'

export class StaffServices {
    private staffRepository = new StaffRepository()

    async initStaffAccount(data: InitStaffData) {
        const { username, first_name, last_name, email, password } = data
        if (!username || !first_name || !last_name || !email || !password) {
            throw new Error('Missing required fields: username, first_name, last_name, email, password')
        }
        const totalStaff = await this.staffRepository.countStaff()
        if (totalStaff > 0) {
            throw new Error('Admin account already initialized')
        }
        const passwordHash = await bcrypt.hash(password, 10)
        const staffId = await this.staffRepository.createStaff({
            username,
            email,
            first_name,
            last_name,
            password_hash: passwordHash
        })
        return { staffId, username, email }
    }

    async updateProfile(id: number, data: UpdateProfileData): Promise<boolean> {
        const staff = await this.staffRepository.findById(id)
        if (!staff) {
            throw new Error('Staff not found')
        }

        const hasData =
            data.first_name !== undefined ||
            data.last_name !== undefined ||
            data.email !== undefined ||
            data.phone !== undefined ||
            data.address !== undefined ||
            data.avatar !== undefined

        if (!hasData) {
            throw new Error('No data to update')
        }

        if (data.email !== undefined) {
            const existingEmail = await this.staffRepository.findByEmail(data.email)
            if (existingEmail && existingEmail.id !== id) {
                throw new Error('Email already in use by another staff member')
            }
        }

        return this.staffRepository.updateProfile(id, data)
    }
}

