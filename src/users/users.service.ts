import FileStorage from 'common/interfaces/FileStorage';
import FileStorageRepository from 'common/repositories/FileStorageRepository';
import prisma from 'common/prismaClient';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import supabaseClient, { BUCKET_NAME } from 'common/supabaseClient';
import CustomUser from 'common/models/CustomUser';
import prismaUserToUser from 'common/utils/prismaUserToUser';
import DuplicateUsernameError from 'common/exceptions/DuplicateUsernameError';

const fileStorageRepository: FileStorage = FileStorageRepository;

export async function getUserById(id: number): Promise<CustomUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      displayName: true,
      username: true,
      bio: true,
      profileImage: { select: { url: true } },
      isTestAccount: true,
      _count: { select: { posts: true, followedBy: true, following: true } }
    }
  });

  if (!user) return null;

  return prismaUserToUser(user);
}

export async function getUserByUsername(
  username: string,
  clientId?: number
): Promise<CustomUser | null> {
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      id: true,
      displayName: true,
      username: true,
      bio: true,
      profileImage: { select: { url: true } },
      _count: { select: { posts: true, followedBy: true, following: true } },
      followedBy: { where: { id: clientId }, select: { id: true } }
    }
  });

  if (!user) return null;

  return prismaUserToUser(user, clientId);
}

export async function addFollower(id: number, followerId: number): Promise<boolean> {
  try {
    const user = await prisma.user.update({
      select: { id: true },
      where: { id },
      data: { followedBy: { connect: { id: followerId } } }
    });

    return !!user;
  } catch (err) {
    if (
      err instanceof PrismaClientKnownRequestError &&
      (err.code === 'P2016' || err.code === 'P2025')
    )
      return false;
    throw err;
  }
}

export async function removeFollower(id: number, followerId: number): Promise<boolean> {
  try {
    const user = await prisma.user.update({
      select: { id: true },
      where: { id },
      data: { followedBy: { disconnect: { id: followerId } } }
    });
    return !!user;
  } catch (err) {
    if (
      err instanceof PrismaClientKnownRequestError &&
      (err.code === 'P2016' || err.code === 'P2025')
    )
      return false;
    throw err;
  }
}

export async function updateUser(
  id: number,
  data: {
    username?: string;
    displayName?: string;
    bio?: string;
  }
): Promise<CustomUser | null> {
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      select: {
        id: true,
        displayName: true,
        username: true,
        bio: true,
        profileImage: { select: { url: true } }
      },
      data: {
        username: data.username,
        displayName: data.displayName,
        bio: data.bio
      }
    });

    return prismaUserToUser(updatedUser);
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        const target = (err.meta as any).target;

        if (target[0] === 'username') throw new DuplicateUsernameError();
      }
    }
    throw err;
  }
}

export async function updatePhoto(
  userId: number,
  image: Express.Multer.File
): Promise<Pick<CustomUser, 'id' | 'profileImage'> | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profileImage: { select: { key: true, id: true } } }
  });

  if (!user) return null;

  if (user.profileImage) await fileStorageRepository.deleteMany([user.profileImage?.key]);

  try {
    const imageKey = `users/${userId}/${Date.now()}.webp`;
    await fileStorageRepository.upload({
      file: image,
      key: imageKey
    });

    const imageUrl =
      supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(imageKey).publicURL || '';

    if (user.profileImage) {
      await prisma.file.update({
        where: { id: user.profileImage.id },
        data: { url: imageUrl, key: imageKey }
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          profileImage: {
            create: { url: imageUrl, key: imageKey }
          }
        }
      });
    }

    return { id: userId, profileImage: imageUrl };
  } catch (err) {
    throw err;
  }
}

export async function getSuggestedUsers(clientId: number): Promise<Array<CustomUser> | null> {
  const client = await prisma.user.findUnique({
    where: { id: clientId },
    select: { following: { take: 10, orderBy: { createdAt: 'desc' }, select: { id: true } } }
  });
  if (!client) return null;

  const select = {
    id: true,
    username: true,
    profileImage: { select: { url: true } }
  };

  const followsFollows = await prisma.user.findMany({
    where: {
      followedBy: {
        some: { id: { in: client?.following.map(user => user.id) } }
      },
      id: { not: clientId }
    },
    orderBy: { createdAt: 'desc' },
    take: 7,
    select
  });

  const newUsers = await prisma.user.findMany({
    where: {
      id: { notIn: [...followsFollows.map(user => user.id), clientId] }
    },
    orderBy: { createdAt: 'desc' },
    take: 7,
    select
  });

  return [...followsFollows, ...newUsers]
    .sort(() => 0.5 - Math.random())
    .slice(0, 5)
    .map(prismaUserToUser);
}
