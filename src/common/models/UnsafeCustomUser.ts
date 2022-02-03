import CustomUser from "./CustomUser";

export default interface UnsafeCustomUser extends CustomUser {
  id: number;
  username: string;
  displayName?: string;
  profileImage?: string;
  bio?: string;
  password: string;
  _count?: { following: number; followedBy: number; posts: number };
}
