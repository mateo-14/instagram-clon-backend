export default interface PublicUser {
  id: number;
  username: string;
  displayName?: string;
  profileImage?: string;
  totalPosts?: number;
  bio?: string;
}
