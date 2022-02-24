import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import FileStorage from 'common/interfaces/FileStorage';
import UserPost from 'common/models/UserPost';
import FileStorageRepository from 'common/repositories/FileStorageRepository';
import prisma from 'common/prismaClient';
import path from 'path';
import supabaseClient, { BUCKET_NAME } from 'common/supabaseClient';
import prismaPostToUserPost from 'common/utils/prismaPostToUserPost';

const fileStorageRepository: FileStorage = FileStorageRepository;

export async function addLike(postId: number, userId: number): Promise<boolean> {
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

export async function removeLike(postId: number, userId: number): Promise<boolean> {
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

export async function createPost(
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
    await fileStorageRepository.uploadMany(
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
    await fileStorageRepository.deleteMany(keys);
    await prisma.post.delete({ where: { id: postId } });
    throw err;
  }
}

export async function deletePost(id: number, authorId: number): Promise<boolean> {
  const post = await prisma.post.findFirst({
    where: { id, authorId },
    include: { images: { select: { key: true } } },
  });
  if (!post) return false;
  await prisma.post.delete({ where: { id } });
  await fileStorageRepository.deleteMany(post.images.map((image) => image.key));
  return true;
}

export async function getPost(id: number, userId?: number): Promise<UserPost | null> {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      _count: {
        select: { comments: true, likes: true },
      },
      images: { select: { url: true } },
      author: { select: { id: true, username: true, profileImage: true } },
      likes: userId ? { where: { userId }, select: { userId: true } } : false,
    },
  });

  if (!post) return null;

  return prismaPostToUserPost(post, userId);
}

export async function getFeedPosts(userId: number, last: number): Promise<UserPost[]> {
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
      likes: { where: { userId }, select: { userId: true } },
    },
  });

  return posts.map((post) => prismaPostToUserPost(post, userId));
}
