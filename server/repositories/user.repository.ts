import prisma from '~~/server/database/client'

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

export async function getUserByPhone(phone: string) {
  return await prisma.user.findUnique({
    where: {phone}
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

export async function createUser(phone: string) {
  return await prisma.user.create({
    data: {
      phone
    }
  })
}

export async function updateUserById(id: number, data: { name?: string | null; email?: string | null }) {
  return await prisma.user.update({
    where: { id },
    data
  })
}

export async function getUsersOrderByUserId(userId: number) {
  return await prisma.order.findMany({
    where: {userId: userId},
    orderBy: {createdAt: 'desc'},
    include: {
      items: {
        include: {
          product: true
        }
      }

    }
  })
}