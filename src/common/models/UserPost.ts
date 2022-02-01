import PublicUser from './PublicUser';

export default interface UserPost {
  id: number;
  createdAt: Date;
  text: string;
  images: string[];
  authorId: number;
  author: PublicUser;
}
