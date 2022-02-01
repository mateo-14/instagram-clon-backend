import { PostLike } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import FileStorage from 'common/interfaces/FileStorage';
import UserPost from 'common/models/UserPost';
import FileStorageRepository from 'common/repositories/StorageRepository';
import prisma from 'common/prismaClient';
import path from 'path';
import supabaseClient, { BUCKET_NAME } from 'common/supabaseClient';

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

  async removeLike(postId: number, userId: number): Promise<PostLike | null> {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return null;
    try {
      const like = await prisma.postLike.delete({ where: { userId_postId: { userId, postId } } });
      return like;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') return null;
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
      await this.fileStorageRepository.uploadFiles(
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
        ...post,
        images: keys.map(
          (key) => supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(key).publicURL || ''
        ),
        author: { ...post.author, profileImage: post.author.profileImage?.url },
      };
    } catch (err) {
      console.error(err);
      await this.fileStorageRepository.deleteFiles(keys);
      await prisma.post.delete({ where: { id: post.id } });
      throw err;
    }
  }
}

export default new PostService(FileStorageRepository);
