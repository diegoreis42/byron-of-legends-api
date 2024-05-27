import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { IUser } from '../user.interface';

export class UserDto implements IUser {
  @IsUUID()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail({
    domain_specific_validation: true,
    host_whitelist: ['byronsolutions.com'],
  })
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(5)
  password: string;
}
