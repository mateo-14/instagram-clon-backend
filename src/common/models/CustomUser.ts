export default interface CustomUser {
  id: number;
  username: string;
  displayName?: string;
  profileImage?: string;
  bio?: string;
  _count?: { following: number; followedBy: number; posts: number };
  followedByClient: boolean;
}
