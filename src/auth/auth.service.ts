import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import prisma from 'common/prismaClient';
import DuplicateEmailError from './exceptions/DuplicateEmailError';
import DuplicateUserError from './exceptions/DuplicateUsernameError';
import AuthUser from 'common/models/AuthUser';
import bcrypt from 'bcrypt';
import InvalidPasswordError from './exceptions/InvalidPasswordError';
import { File, User } from '@prisma/client';

type SelectUser = User & { _count: { posts: number } } & { profileImage: { url: string } | null };

const prismaUserToAuthUser = (user: SelectUser): AuthUser => ({
  id: user.id,
  username: user.username,
  email: user.email,
  profileImage: user.profileImage?.url,
  displayName: user.displayName || undefined,
  totalPosts: user._count.posts || undefined,
  bio: user.bio || undefined,
});

export async function createUser(
  username: string,
  email: string,
  password: string,
  displayName: string | null
): Promise<AuthUser> {
  try {
    const hash = await bcrypt.hash(password, 10);
    const user: SelectUser = await prisma.user.create({
      data: { username, email, password: hash, displayName },
      include: {
        _count: {
          select: { posts: true },
        },
        profileImage: { select: { url: true } },
      },
    });
    return prismaUserToAuthUser(user);
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

export async function login(username: string, password: string): Promise<AuthUser | null> {
  const user: SelectUser | null = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: { posts: true },
      },
      profileImage: { select: { url: true } },
    },
  });
  if (!user) return null;

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (isPasswordValid) return prismaUserToAuthUser(user);
  throw new InvalidPasswordError();
}
