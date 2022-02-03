import { User } from '@prisma/client';
import CustomUser from 'common/models/CustomUser';

interface PrismaUser {
  id: number;
  username: string;
  password?: string;
  displayName: string | null;
  bio: string | null;
  createdAt?: Date;
  _count?: { following: number; followedBy: number; posts: number };
  profileImage?: { url: string } | null;
}

export const prismaUserToUser = (user: PrismaUser): CustomUser => ({
  id: user.id,
  username: user.username,
  profileImage: user.profileImage?.url,
  displayName: user.displayName || undefined,
  _count: user._count,
  bio: user.bio || undefined,
});
