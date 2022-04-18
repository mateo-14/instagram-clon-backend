import type CustomUser from './CustomUser';

export default interface CustomComment {
  id: number;
  postId: number;
  createdAt: Date;
  text: string;
  author:  Omit<CustomUser, 'followedByClient'>;
  _count: {
    likes: number;
    replies: number;
  };
  hasClientLike?: boolean;
  commentRepliedId?: number;
}
