import CustomUser from './CustomUser';

export default interface UserPost {
  id: number;
  createdAt: Date;
  text: string;
  images: string[];
  author: CustomUser;
  _count: {
    comments: number;
    likes: number;
  };
}
