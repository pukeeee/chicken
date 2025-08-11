import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET || 'secret'

export const createToken = (payload: object, expiresIn: string = '1d') => {
    return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
}

export const verifyToken = (token: string) =>
    jwt.verify(token, secret)