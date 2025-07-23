import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET || 'secret'
// const expiresIn = process.env.JWT_EXPIRATION || '1d'

export const createToken = (payload: object) =>
    jwt.sign(payload, secret, {expiresIn: '1d'})

export const verifyToken = (token: string) =>
    jwt.verify(token, secret)