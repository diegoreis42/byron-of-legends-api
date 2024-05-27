import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersRepository } from '../users';
import { UserDto, UserEmailDto } from '../users/dtos';
import { AuthService } from './auth.service';
import { ResetPasswordDto } from './dtos';
import { JwtAuthGuard, LocalAuthGuard } from './guards';


@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class AuthController {
  constructor(
    private userRepository: UsersRepository,
    private authService: AuthService,
  ) { }

  @Post('/register')
  register(@Body() body: UserDto) {
    return this.authService.createUser(body);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req) {
    return req.user;
  }


  @Post('reset-password/token')
  requestResetPassword(@Body() user: UserEmailDto) {
    return this.authService.requestResetPassword(user);
  }

  @Post('reset-password')
  resetPassword(@Body() payload: ResetPasswordDto) {
    return this.authService.resetPassword(payload);
  }
}
