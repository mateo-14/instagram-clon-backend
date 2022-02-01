import FileStorage from 'common/interfaces/FileStorage';
import FileStorageRepository from 'common/repositories/FileStorageRepository';
import prisma from 'common/prismaClient';
import PublicUser from 'common/models/PublicUser';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

class UsersService {
  constructor(private fileStorageRepository: FileStorage) {}

  async getUserById(id: number): Promise<PublicUser | null> {
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
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName || undefined,
      bio: user.bio || undefined,
      profileImage: user.profileImage?.url,
      _count: user._count,
    };
  }

  async addFollower(id: number, followerId: number): Promise<boolean> {
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

  async removeFollower(id: number, followerId: number): Promise<boolean> {
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
}

export default new UsersService(FileStorageRepository);
