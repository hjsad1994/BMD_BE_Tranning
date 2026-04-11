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
            password_hash: passwordHash,
            status: 'active'
        })
        return { staffId, username, email }
    }
    // create staff account 
    async createStaff(data: InitStaffData) {
        const { username, first_name, last_name, email, password } = data
        if (!username || !first_name || !last_name || !email || !password) {
            throw new Error('Missing required fields: username, first_name, last_name, email, password')
        }
        const passwordHash = await bcrypt.hash(password, 10)
        const staffId = await this.staffRepository.createStaff({
            username,
            email,
            first_name,
            last_name,
            password_hash: passwordHash,
            status: 'active'
        })
        return { staffId, username, email }
    }
    // update self profile
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
    async updateStatus(id: number, status: 'active' | 'inactive'): Promise<boolean> {
        if(!['active', 'inactive'].includes(status)) {
            throw new Error('Invalid status value')
        }
        const staff = await this.staffRepository.findById(id)
        if(!staff) {
            throw new Error('staff not found')
        }
        return this.staffRepository.updateStatus(id, status)
    }
    async changePassword(id: number, oldPassword: string, newPassword: string): Promise<boolean> {
        if(!oldPassword || !newPassword) {
            throw new Error('old password and new password is required')
        }
        const staff = await this.staffRepository.findAuthById(id)
        if(!staff) {
            throw new Error('staff not found')
        }
        const isMatch = await bcrypt.compare(oldPassword, staff.password_hash)
        if(!isMatch) {
            throw new Error('Old password is incorrect')
        }
        const passwordHash = await bcrypt.hash(newPassword, 10)
        return await this.staffRepository.updatePassword(id, passwordHash)
    }
    async resetPassword(id: number, newPassword: string): Promise<boolean> {
        if(!newPassword) {
            throw new Error('Password is required')
        }
        const staff = await this.staffRepository.findById(id)
        if(!staff) {
            throw new Error('Staff not found')
        }
        const passwordHash = await bcrypt.hash(newPassword, 10) 
        return this.staffRepository.updatePassword(id ,passwordHash)
    }
    async getAllStaffProfile(page: number, limit: number) {
        const [staffs, total] = await Promise.all([
            this.staffRepository.findAllPaginated(page, limit),
            this.staffRepository.countStaff(),
        ])
        return {
            staff: staffs,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        }
    }
    async getProfileStaff(id: number) {
        const staff = await this.staffRepository.findById(id)
        if (!staff) {
            throw new Error('Staff not found')
        }
        return staff
    }
    async getStaffById(id: number) {
        const staff = await this.staffRepository.findById(id)
        if (!staff) {
            throw new Error('Staff not found')
        }
        return staff
    }
}

