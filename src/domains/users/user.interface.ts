export interface IUser {
  id?: string;
  name: string;
  email: string;
  password?: string;
  reset_password_token?: string;
  reset_password_token_time?: string;
}
