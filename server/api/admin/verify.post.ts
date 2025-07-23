import { verifyToken } from '../../services/jwt'
import { getUserById } from '../../models/userModel'

export default defineEventHandler(async (event) => {
    const authHeader = getHeader(event, 'Authorization')
    console.log('Auth header:', authHeader)

    if (!authHeader) {
        throw createError({ 
            statusCode: 401, 
            message: 'No token provided', 
            fatal: false 
        })
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('Token to verify:', token)

    try {
        const decoded = verifyToken(token) as { id: number, role: string }

        const user = await getUserById(decoded.id)

        if (!user || user.token !== token || user.role !== 'ADMIN') {
            console.log('Token verification failed:', {
                userExists: !!user,
                tokenMatch: user?.token === token,
                roleMatch: user?.role === 'ADMIN'
            })
            throw createError({ 
                statusCode: 401, 
                message: 'Invalid token', 
                fatal: false 
            })
        }

        return { valid: true, user: decoded }
    } catch (err) {
        console.log('Token verification error:', err)
        throw createError({ 
            statusCode: 401, 
            message: 'Invalid token', 
            fatal: false 
        })
    }
})