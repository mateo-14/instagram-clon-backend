import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import prisma from 'common/prismaClient';
import DuplicateUserError from '../common/exceptions/DuplicateUsernameError';
import bcrypt from 'bcrypt';
import InvalidPasswordError from './exceptions/InvalidPasswordError';
import prismaUserToUser from 'common/utils/prismaUserToUser';
import * as jwtService from 'common/jwt/jwt.service';
import { AuthUser } from 'common/models/AuthUser';
import UnsafeCustomUser from 'common/models/UnsafeCustomUser';

export async function createUser(
  username: string,
  password: string,
  displayName: string | null
): Promise<AuthUser> {
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hash, displayName },
      include: {
        profileImage: { select: { url: true } },
      },
    });

    const token: string = await jwtService.generateToken(user.id);
    return {
      ...prismaUserToUser({ ...user, _count: { posts: 0, followedBy: 0, following: 0 } }),
      token,
    };
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        const target = (err.meta as any).target;
        if (target[0] === 'username') throw new DuplicateUserError();
      }
    }
    throw err;
  }
}

async function getUnsafeUser(where: any): Promise<UnsafeCustomUser | null> {
  const user = await prisma.user.findUnique({
    where,
    select: { password: true, id: true },
  });

  if (!user) return null;

  return { id: user.id, password: user.password };
}

export async function login(username: string, password: string): Promise<AuthUser | null> {
  const user: UnsafeCustomUser | null = await getUnsafeUser({ username });
  if (!user) return null;

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (isPasswordValid) {
    const token: string = await jwtService.generateToken(user.id);
    user.password = undefined!;
    return { ...user, token };
  }
  throw new InvalidPasswordError();
}

export async function auth(token: string): Promise<AuthUser | null> {
  const { userId } = await jwtService.verifyToken(token);
  const user: UnsafeCustomUser | null = await getUnsafeUser({ id: userId });
  if (!user) return null;

  const newToken: string = await jwtService.generateToken(user.id);
  user.password = undefined!;
  return { ...user, token: newToken };
}

export async function loginWithATestAccount(): Promise<AuthUser | null> {
  const user = await prisma.user.findFirst({
    where: { isTestAccount: true },
    select: { id: true },
  });
  if (!user) return null;

  const token: string = await jwtService.generateToken(user.id);

  return { ...user, token };
}
