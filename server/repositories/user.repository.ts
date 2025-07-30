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
    return await prisma.user.update({
        where: {id},
        data: {token}
    })
}

export async function removeToken(id: number) {
    return await prisma.user.update({
        where: {id},
        data: {token: null}
    })
}