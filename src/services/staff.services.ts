
import bcrypt from 'bcrypt'

import { StaffRepository } from '../repository/staff.repository.js'
import { error } from 'node:console'

interface InitStaffData {
    username: string
    first_name: string
    last_name: string
    email: string
    password: string
}
interface UpdateProfileData {
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    address?: string
    avatar?: string
  }
export class StaffServices {
    private StaffRepository = new StaffRepository()
    async initStaffAccount(data: InitStaffData) {
        const { username, first_name, last_name, email, password } = data
        if (!username || !first_name || !last_name || !email || !password) {
            throw new Error('Missing required fields: username, first_name, last_name, email, password')
        }
        const totalStaff = await this.StaffRepository.countStaff()
        if(totalStaff > 0) {
            throw new Error('Admin account already init')
        }
        const passwordHash = await bcrypt.hash(password, 10)
        // create staff 
        const staffId = await this.StaffRepository.createStaff({
            username: data.username,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            password_hash: passwordHash
        })
        return {
            staffId,
            username: data.username,
            email: data.email
        }
    }
    async updateProfile(id: number, data: UpdateProfileData): Promise<boolean> {
        const staff = await this.StaffRepository.findById(id)
        if(!staff) {
            throw new Error('staff not found')
        }
        // has data 
        const hasData = data.first_name !== undefined ||
        data.last_name !== undefined ||
        data.email !== undefined ||
        data.phone !== undefined ||
        data.address !== undefined ||
        data.avatar !== undefined
        if(!hasData) {
            throw new Error('no data to update')
        }
        if(data.email !== undefined) {
            const existingEmail = await this.StaffRepository.findByEmail(data.email)
           // If the email already exists and belongs to another user
            if(existingEmail && existingEmail.id !== id) {
                throw new Error('email already in use')
            }
        }
        return await this.StaffRepository.updateProfile(id, data)
    }
}