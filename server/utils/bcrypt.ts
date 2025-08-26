import bcrypt from 'bcrypt'

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10

export const hash = (password: string) =>
    bcrypt.hash(password, SALT_ROUNDS)

export const compare = (password: string, hash: string) =>
    bcrypt.compare(password, hash)