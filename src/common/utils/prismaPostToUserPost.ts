import { File, Post, PostLike } from '@prisma/client';
import Like from 'common/models/Like';
import UserPost from 'common/models/UserPost';

type PrismaPost = Post & {
  author: { id: number; username: string; profileImage: File | null };
  images: { url: string }[];
  _count?: { likes: number; comments: number };
  likes?: Like[];
};

const prismaPostToUserPost = (post: PrismaPost, userId?: number): UserPost => ({
  id: post.id,
  text: post.text,
  createdAt: post.createdAt,
  author: { ...post.author, profileImage: post.author.profileImage?.url },
  images: post.images?.map((image) => image.url),
  _count: post._count || { likes: 0, comments: 0 },
  hasClientLike: post.likes && userId ? post.likes.some((like) => like.userId === userId) : undefined,
});
export default prismaPostToUserPost;