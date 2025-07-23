import prisma from '../database/client'

export async function getUserByEmail(email: string) {
    return await prisma.user.findUnique({
        where: {email}
    })
}

export async function getUserById(id: number) {
    return await prisma.user.findUnique({
        where: {id}
    })
}

export async function setToken(id: number, token: string) {
    console.log('Saving token to DB:', { id, token })
    return await prisma.user.update({
        where: {id},
        data: {token}
    })
}