import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { UserDto } from 'src/domains/users/dtos';

export class ResetPasswordDto extends PickType(UserDto, ['password']) {
  @IsUUID(4, { message: 'Token inválido' })
  @IsNotEmpty()
  token: string;
}
