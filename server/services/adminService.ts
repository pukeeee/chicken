import { getUserByEmail, setToken } from '../models/userModel'
import { compare } from '../../utils/bcrypt'
import { createToken } from '../services/jwt'

export const adminLogin = async (email: string, password: string) => {
    const admin = await getUserByEmail(email)

    if (!admin || admin.role !== 'ADMIN' || !admin.password) {
        console.log('Admin check failed:', { 
            exists: !!admin, 
            role: admin?.role, 
            hasPassword: !!admin?.password 
        })
        throw createError({
            statusCode: 401,
            message: 'Invalid credentials',
            fatal: false
        })
    }

    const validPassword = await compare(password, admin.password)
    console.log('Password check:', { valid: validPassword })
    
    if (!validPassword) {
        throw createError({
            statusCode: 401,
            message: 'Invalid credentials',
            fatal: false
        })
    }

    const token = createToken({ id: admin.id, role: admin.role })
    console.log('Created token:', token)
    
    // Обновляем токен в базе данных
    await setToken(admin.id, token)

    return { token }
}