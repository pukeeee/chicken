import { getUserByEmail, setToken } from '~~/server/repositories/user.repository'
import { compare } from '~~/server/utils/bcrypt'
import { createToken } from '~~/server/utils/jwt'
import { setCachedUser } from '~~/server/utils/userCache'

export const adminLogin = async (email: string, password: string) => {
    const admin = await getUserByEmail(email)

    if (!admin || admin.role !== 'ADMIN' || !admin.password) {
        throw createError({
            statusCode: 401,
            message: 'Invalid credentials',
            fatal: false
        })
    }

    // Оновлюємо кеш свіжими даними адміна
    setCachedUser(admin)

    const validPassword = await compare(password, admin.password)
    
    if (!validPassword) {
        throw createError({
            statusCode: 401,
            message: 'Invalid credentials',
            fatal: false
        })
    }

    const token = createToken({ id: admin.id, role: admin.role }, '1d')
    
    // Обновляем токен в базе данных
    await setToken(admin.id, token)

    return { token }
}