import jwt, { JwtPayload } from 'jsonwebtoken';
import { TokenPayload } from './TokenPayload';

export function generateToken(userId: number): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { userId },
      process.env.TOKEN_SECRET!,
      { expiresIn: '30d' },

      (err: Error | null, token: string | undefined) => {
        if (err) return reject(err);
        if (token) resolve(token);
      }
    );
  });
}

export function verifyToken(token: string): Promise<TokenPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      process.env.TOKEN_SECRET!,
      (err: Error | null, decoded: string | JwtPayload | undefined) => {
        if (err) return reject(err);
        if (decoded) resolve(decoded as TokenPayload);
      }
    );
  });
}
