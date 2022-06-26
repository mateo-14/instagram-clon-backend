import CustomUser from 'common/models/CustomUser';

interface PrismaUser {
  id: number;
  username: string;
  displayName?: string | null;
  bio?: string | null;
  createdAt?: Date;
  _count?: { following: number; followedBy: number; posts: number };
  profileImage?: { url: string } | null;
  followedBy?: { id: number }[];
  isTestAccount?: boolean;
}

const prismaUserToUser = (user: PrismaUser, clientId?: number): CustomUser => ({
  id: user.id,
  username: user.username,
  profileImage: user.profileImage?.url,
  displayName: user.displayName || undefined,
  _count: user._count,
  bio: user.bio || undefined,
  isTestAccount: user.isTestAccount,
  followedByClient: user.followedBy?.some((follower) => follower.id === clientId),
});

export default prismaUserToUser;
