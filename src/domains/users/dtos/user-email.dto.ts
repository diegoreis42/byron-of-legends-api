import { PickType } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class UserEmailDto extends PickType(UserDto, ['email']) {}
