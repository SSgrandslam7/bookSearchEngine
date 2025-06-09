import jwt, { JwtPayload } from 'jsonwebtoken';
import type { Request } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.JWT_SECRET_KEY || 'supersecret';

export interface TokenPayload extends JwtPayload{
  _id: string;
  email: string;
  username: string;
}

export function signToken(user: TokenPayload): string {
  const payload: TokenPayload = {
    _id: user._id,
    email: user.email,
    username: user.username,
  };

  return jwt.sign(payload, secret, { expiresIn: '2h' });
}

export async function authenticateToken({ req }: { req: Request }): Promise<{ user: TokenPayload | null }> {
  let token = req.body.token || req.query.token || req.headers.authorization;

  if (req.headers.authorization) {
    token = token.split(' ').pop();
  }

  if (!token) {
    return { user: null };
  }

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return { user: decoded };
  } catch (error) {
    console.warn('Invalid token');
    return { user: null };
  }
}
