import { File, Post } from '@prisma/client';
import UserPost from 'common/models/UserPost';

type PrismaPost = Post & {
  author: { id: number; username: string; profileImage: File | null };
  images: { url: string }[];
  _count?: { likes: number; comments: number };
};

const prismaPostToUserPost = (post: PrismaPost): UserPost => ({
  id: post.id,
  text: post.text,
  createdAt: post.createdAt,
  author: { ...post.author, profileImage: post.author.profileImage?.url },
  images: post.images?.map((image) => image.url),
  _count: post._count || { likes: 0, comments: 0 },
});
export default prismaPostToUserPost;