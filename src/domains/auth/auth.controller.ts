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
import { UserDto } from '../users/user.dto';
import { UsersRepository } from '../users/users.repository';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class AuthController {
  constructor(
    private userRepository: UsersRepository,
    private authService: AuthService,
  ) {}

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

  @UseGuards(JwtAuthGuard)
  @Post('reset-password')
  requestResetPassword(@Request() req) {
    return this.authService.requestResetPassword(req.user);
  }

  @Post('reset-password/:token')
  resetPassword(@Param('token') token: string, @Body() user: UserDto) {
    return this.authService.resetPassword(user, token);
  }
}
