export default interface PublicUser {
  id: number;
  username: string;
  displayName?: string;
  profileImage?: string;
  bio?: string;
  _count?: { following: number; followedBy: number; posts: number };
}
