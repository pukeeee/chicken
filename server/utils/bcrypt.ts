import bcrypt from 'bcrypt'

export const hash = (password: string) =>
    bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS))

export const compare = (password: string, hash: string) =>
    bcrypt.compare(password, hash)