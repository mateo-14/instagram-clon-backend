import PublicUser from 'common/models/PublicUser';

export default interface AuthUser extends PublicUser {
  email: string;
}
