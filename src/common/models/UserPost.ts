import PublicUser from './PublicUser';

export default interface UserPost {
  id: number;
  createdAt: Date;
  text: string;
  images: string[];
  totalComments: number;
  totalLikes: number;
  author: PublicUser;
}
