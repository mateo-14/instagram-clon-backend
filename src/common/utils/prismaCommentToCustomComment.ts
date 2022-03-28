import { Comment, File } from '@prisma/client';
import CustomComment from 'common/models/CustomComment';
import Like from 'common/models/Like';

function prismaCommentToCustomComment(
  comment: Comment & {
    author: { id: number; username: string; profileImage: File | null };
    commentReplied: { id: number } | null;
    _count: { likes: number; replies: number };
    likes?: Like[];
  },
  clientId?: number
): CustomComment {
  return {
    id: comment.id,
    postId: comment.postId,
    text: comment.text,
    _count: comment._count,
    createdAt: comment.createdAt,
    commentRepliedId: comment.commentReplied?.id,
    author: { ...comment.author, profileImage: comment.author.profileImage?.url },
    hasClientLike:
      comment.likes && clientId
        ? comment.likes.some((like) => like.userId === clientId)
        : undefined,
  };
}
export default prismaCommentToCustomComment;
