import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import CustomComment from 'common/models/CustomComment';
import prisma from 'common/prismaClient';
import prismaCommentToCustomComment from 'common/utils/prismaCommentToCustomComment';

export async function createComment(
  postId: number,
  text: string,
  authorId: number,
  commentRepliedId?: number
): Promise<CustomComment | null> {
  try {
    if (commentRepliedId) {
      const commentReplied = await prisma.comment.findFirst({
        where: { id: commentRepliedId, postId }
      });
      if (!commentReplied || commentReplied?.commentRepliedId !== null) return null;
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        author: { connect: { id: authorId } },
        post: { connect: { id: postId } },
        commentReplied: commentRepliedId ? { connect: { id: commentRepliedId } } : undefined
      },
      include: {
        author: { select: { id: true, username: true, profileImage: { select: { url: true } } } },
        commentReplied: { select: { id: true } },
        _count: { select: { likes: true, replies: true } }
      }
    });
    return prismaCommentToCustomComment(comment);
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') return null;
    throw err;
  }
}

export async function deleteComment(id: number, authorId: number): Promise<boolean> {
  const comment = await prisma.comment.findFirst({
    where: { id, authorId }
  });

  if (!comment) return false;
  await prisma.comment.delete({ where: { id } });
  return true;
}

export async function getComments(
  postId: number,
  last: number,
  commentRepliedId: number | null = null,
  clientId?: number
): Promise<CustomComment[]> {
  const comments = await prisma.comment.findMany({
    where: { postId, commentRepliedId },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, username: true, profileImage: { select: { url: true } } } },
      commentReplied: { select: { id: true } },
      _count: { select: { likes: true, replies: true } },
      likes: { where: { userId: clientId }, select: { userId: true } }
    },
    cursor: last ? { id: last } : undefined,
    skip: last ? 1 : 0,
    take: 5
  });

  return comments.map(comment => prismaCommentToCustomComment(comment, clientId));
}

export async function addLike(commentId: number, userId: number): Promise<boolean> {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return false;

  try {
    await prisma.commentLike.create({ data: { userId, commentId } });
    return true;
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') return true;
    throw err;
  }
}

export async function removeLike(commentId: number, userId: number): Promise<boolean> {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return false;
  try {
    await prisma.commentLike.delete({ where: { userId_commentId: { userId, commentId } } });
    return true;
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') return true;
    throw err;
  }
}
