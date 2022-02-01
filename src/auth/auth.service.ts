import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import prisma from 'common/prismaClient';
import DuplicateEmailError from '../common/exceptions/DuplicateEmailError';
import DuplicateUserError from '../common/exceptions/DuplicateUsernameError';
import bcrypt from 'bcrypt';
import InvalidPasswordError from './exceptions/InvalidPasswordError';
import { prismaUserToUser } from 'common/util/prismaUserToUser';
import CustomUser from 'common/models/CustomUser';

export async function createUser(
  username: string,
  email: string,
  password: string,
  displayName: string | null
): Promise<CustomUser> {
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hash, displayName },
      include: {
        profileImage: { select: { url: true } },
      },
    });
    return prismaUserToUser({ ...user, _count: { posts: 0, followedBy: 0, following: 0 } });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        const target = (err.meta as any).target;
        if (target[0] === 'email') throw new DuplicateEmailError();

        if (target[0] === 'username') throw new DuplicateUserError();
      }
    }
    throw err;
  }
}

export async function login(username: string, password: string): Promise<CustomUser | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: { posts: true, followedBy: true, following: true },
      },
      profileImage: { select: { url: true } },
    },
  });
  if (!user) return null;

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (isPasswordValid) return prismaUserToUser(user);
  throw new InvalidPasswordError();
}
