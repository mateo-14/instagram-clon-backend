import FileStorage from 'common/interfaces/FileStorage';
import FileStorageRepository from 'common/repositories/FileStorageRepository';
import prisma from 'common/prismaClient';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import path from 'path';
import supabaseClient, { BUCKET_NAME } from 'common/supabaseClient';
import CustomUser from 'common/models/CustomUser';
import prismaUserToUser from 'common/utils/prismaUserToUser';
import DuplicateUsernameError from 'common/exceptions/DuplicateUsernameError';
import UnsafeCustomUser from 'common/models/UnsafeCustomUser';

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
      _count: { select: { posts: true, followedBy: true, following: true } },
    },
  });

  if (!user) return null;

  return prismaUserToUser(user);
}

export async function addFollower(id: number, followerId: number): Promise<boolean> {
  try {
    const user = await prisma.user.update({
      select: { id: true },
      where: { id },
      data: { followedBy: { connect: { id: followerId } } },
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
      data: { followedBy: { disconnect: { id: followerId } } },
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
    image?: Express.Multer.File;
  }
): Promise<CustomUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { profileImage: { select: { key: true } } },
  });

  if (!user) return null;

  const newData: any = {
    username: data.username,
    displayName: data.displayName,
    bio: data.bio,
  };

  if (data.image) {
    if (user.profileImage) await fileStorageRepository.deleteMany([user.profileImage?.key]);

    try {
      const imageKey = `users/${id}/profile${path.extname(data.image.originalname)}`;
      await fileStorageRepository.upload({
        file: data.image,
        key: imageKey,
      });

      const imageUrl =
        supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(imageKey).publicURL || '';

      newData.profileImage = { create: { key: imageKey, url: imageUrl } };
    } catch (err) {
      throw err;
    }
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      select: {
        id: true,
        displayName: true,
        username: true,
        bio: true,
        profileImage: { select: { url: true } },
      },
      data: newData,
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

export async function getUnsafeUser(where: any): Promise<UnsafeCustomUser | null> {
  const user = await prisma.user.findUnique({
    where,
    include: {
      _count: {
        select: { posts: true, followedBy: true, following: true },
      },
      profileImage: { select: { url: true } },
    },
  });

  if (!user) return null;

  return { ...prismaUserToUser(user), password: user.password };
}

export async function getUserByUsername(username: string): Promise<CustomUser | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      displayName: true,
      username: true,
      bio: true,
      profileImage: { select: { url: true } },
      _count: { select: { posts: true, followedBy: true, following: true } },
    },
  });

  if (!user) return null;

  return prismaUserToUser(user);
}
