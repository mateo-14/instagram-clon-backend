import PublicUser from './PublicUser';

export default interface UserPost {
  id: number;
  createdAt: Date;
  text: string;
  images: string[];
  author: PublicUser;
  _count: {
    comments: number;
    likes: number;
  };
}
