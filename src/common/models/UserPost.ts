import type CustomUser from './CustomUser';

export default interface UserPost {
  id: number;
  createdAt: Date;
  text: string;
  images: string[];
  author: Omit<CustomUser, 'followedByClient'>;
  _count: {
    comments: number;
    likes: number;
  };
  hasClientLike: boolean;
}
