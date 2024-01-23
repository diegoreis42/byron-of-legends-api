import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { IUser } from './user.interface';

export class UserDto implements IUser {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  //@IsStrongPassword()
  @IsNotEmpty()
  password: string;
}
