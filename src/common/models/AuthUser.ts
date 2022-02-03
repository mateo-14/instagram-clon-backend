import CustomUser from "./CustomUser";

export interface AuthUser extends CustomUser {
  token: string
}