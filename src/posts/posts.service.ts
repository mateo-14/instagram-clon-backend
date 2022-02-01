import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import FileStorage from 'common/interfaces/FileStorage';
import UserPost from 'common/models/UserPost';
import FileStorageRepository from 'common/repositories/FileStorageRepository';
import prisma from 'common/prismaClient';
import path from 'path';
import supabaseClient, { BUCKET_NAME } from 'common/supabaseClient';
import { File, Post } from '@prisma/client';

type PrismaPost = Post & { author: { id: number; username: string; profileImage: File | null } } & {
  _count: { comments: number; likes: number };
};

function prismaPostToUserPost(post: PrismaPost)  {
  return {
    id: post.id,
    authorId: post.authorId,
    text: post.text,
    createdAt: post.createdAt,
    totalComments: post._count.comments,
    totalLikes: post._count.likes,
    author: { ...post.author, profileImage: post.author.profileImage?.url },
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
    const post = await prisma.post.create({
      data: { authorId, text },
      include: { author: { select: { id: true, username: true, profileImage: true } } },
    });

    const keys = images.map(
      (file, i) =>
        `users/${authorId}/posts_images/${post.id}/${i}${path.extname(file.originalname)}`
    );

    try {
      await this.fileStorageRepository.uploadMany(
        images.map((file, i) => ({
          file,
          key: `users/${authorId}/posts_images/${post.id}/${i}${path.extname(file.originalname)}`,
        }))
      );

      await prisma.file.createMany({
        data: keys.map((key) => ({
          key,
          url: supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(key).publicURL || '',
          postId: post.id,
        })),
      });
      return {
        ...prismaPostToUserPost({...post, _count: {comments: 0, likes:0}}),
        images: keys.map(
          (key) => supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(key).publicURL || ''
        ),
      };
    } catch (err) {
      console.error(err);
      await this.fileStorageRepository.deleteMany(keys);
      await prisma.post.delete({ where: { id: post.id } });
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

    return {
      ...prismaPostToUserPost(post),
      images: post.images.map((image) => image.url),
    };
  }
}

export default new PostService(FileStorageRepository);
