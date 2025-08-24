import jwt, { type SignOptions, type JwtPayload } from 'jsonwebtoken'

const secret = process.env.JWT_SECRET || 'secret'

export const createToken = (
    payload: string | object | Buffer,
    expiresIn: SignOptions['expiresIn'] = '1d'
) => {
    return jwt.sign(payload, secret, { expiresIn })
}

export const verifyToken = (token: string): string | JwtPayload =>
    jwt.verify(token, secret)