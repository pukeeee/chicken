import { getUserByEmail } from '../models/userModel'
import { compare } from '../../utils/bcrypt'
import {createToken} from '../services/jwt'

export const adminLogin = async (email: string, password: string) => {
    const admin = await getUserByEmail(email)

    if (!admin || admin.role !== 'ADMIN' || !admin.password) {
        throw createError({statusCode: 404, message: 'User not found'})
    }

    const validPassword = await compare(password, admin.password)
    if (!validPassword) {
        throw createError({statusCode: 401, message: 'Invalid password'})
    }

    const token = createToken({ adminId: admin.id, role: admin.role })

    // update token

    return token
}