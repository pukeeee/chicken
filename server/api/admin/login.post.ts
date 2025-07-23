import {adminLogin} from '../../services/adminService'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const {email, password} = body

    if (!email || !password) {
        throw createError({statusCode: 400, message: 'Email and password are required', fatal: false})
    }

    try{
        const token = await adminLogin(email, password)
        return {token}
    }
    catch (error: any) {
        throw createError({statusCode: error.statusCode || 500, message: error.message || 'Internal Server Error', fatal: false})
    }
})