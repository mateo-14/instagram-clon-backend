import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import FileStorage from 'common/interfaces/FileStorage';
import UserPost from 'common/models/UserPost';
import FileStorageRepository from 'common/repositories/FileStorageRepository';
import prisma from 'common/prismaClient';
import path from 'path';
import supabaseClient, { BUCKET_NAME } from 'common/supabaseClient';
import { File, Post } from '@prisma/client';

type PrismaPost = Post & {
  author: { id: number; username: string; profileImage: File | null };
  images: { url: string }[];
  _count?: { likes: number; comments: number };
};

function prismaPostToUserPost(post: PrismaPost): UserPost {
  return {
    id: post.id,
    text: post.text,
    createdAt: post.createdAt,
    author: { ...post.author, profileImage: post.author.profileImage?.url },
    images: post.images?.map((image) => image.url),
    _count: post._count || { likes: 0, comments: 0 },
  };
}
class PostService {
  constructor(private fileStorageRepository: FileStorage) {}

  async addLike(postId: number, userId: number): Promise<boolean> {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return false;

    try {
      await prisma.postLike.create({ data: { userId, postId } });
      return true;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') return true;
      throw err;
    }
  }

  async removeLike(postId: number, userId: number): Promise<boolean> {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return false;
    try {
      await prisma.postLike.delete({ where: { userId_postId: { userId, postId } } });
      return true;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') return true;
      throw err;
    }
  }

  async createPost(
    images: Express.Multer.File[],
    text: string,
    authorId: number
  ): Promise<UserPost> {
    const { id: postId } = await prisma.post.create({
      data: { authorId, text },
      select: { id: true },
    });

    const keys = images.map(
      (file, i) => `users/${authorId}/posts_images/${postId}/${i}${path.extname(file.originalname)}`
    );

    try {
      await this.fileStorageRepository.uploadMany(
        images.map((file, i) => ({
          file,
          key: `users/${authorId}/posts_images/${postId}/${i}${path.extname(file.originalname)}`,
        }))
      );

      const post = await prisma.post.update({
        where: { id: postId },
        include: {
          author: { select: { id: true, username: true, profileImage: true } },
          images: { select: { url: true } },
        },
        data: {
          images: {
            createMany: {
              data: keys.map((key) => ({
                key,
                url: supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(key).publicURL || '',
              })),
            },
          },
        },
      });

      return prismaPostToUserPost(post);
    } catch (err) {
      console.error(err);
      await this.fileStorageRepository.deleteMany(keys);
      await prisma.post.delete({ where: { id: postId } });
      throw err;
    }
  }

  async deletePost(id: number, authorId: number): Promise<boolean> {
    const post = await prisma.post.findFirst({
      where: { id, authorId },
      include: { images: { select: { key: true } } },
    });
    if (!post) return false;
    await prisma.post.delete({ where: { id } });
    await this.fileStorageRepository.deleteMany(post.images.map((image) => image.key));
    return true;
  }

  async getPost(id: number): Promise<UserPost | null> {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        _count: {
          select: { comments: true, likes: true },
        },
        images: { select: { url: true } },
        author: { select: { id: true, username: true, profileImage: true } },
      },
    });

    if (!post) return null;

    return prismaPostToUserPost(post);
  }

  async getFeedPosts(userId: number, last: number): Promise<UserPost[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { following: { select: { id: true } } },
    });

    if (!user) return [];

    const posts = await prisma.post.findMany({
      where: { authorId: { in: [...user.following.map((follow) => follow.id), userId] } },
      orderBy: { createdAt: 'desc' },
      cursor: last ? { id: last } : undefined,
      skip: last ? 1 : 0,
      take: 5,
      include: {
        _count: {
          select: { comments: true, likes: true },
        },
        images: { select: { url: true } },
        author: { select: { id: true, username: true, profileImage: true } },
      },
    });

    return posts.map((post) => prismaPostToUserPost(post));
  }
}

export default new PostService(FileStorageRepository);
