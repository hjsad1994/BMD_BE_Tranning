
import bcrypt from 'bcrypt'

import { StaffRepository } from '../repository/staff.repository.js'

interface InitStaffData {
    username: string
    first_name: string
    last_name: string
    email: string
    password: string
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
}