import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { AuthEmailService } from 'src/infra/email/auth-email.service';
import { UserEmailDto } from '../users/dtos';
import { IUser } from '../users/user.interface';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { AuthEnum } from './auth.enum';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private userService: UsersService,
    private jwtService: JwtService,
    private emailService: AuthEmailService,
  ) {}

  async createUser(user: IUser): Promise<IUser> {
    const userDB = await this.usersRepository.findOneByEmail(user.email);

    if (userDB) {
      throw new ConflictException('Email já utilizado por outro usuário');
    }

    const newUser = await this.usersRepository.create({
      ...user,
      password: await bcrypt.hash(user.password, AuthEnum.SALT_ROUND),
    });

    return { id: newUser.id, email: newUser.email, name: newUser.name };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOneByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      /* eslint-disable */
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: IUser) {
    const payload = { name: user.name, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async requestResetPassword(userEmail: UserEmailDto) {
    const userDB = await this.userService.findOneByEmail(userEmail.email);
    const token = randomUUID();
    const hash = createHash(AuthEnum.HASH_ALGORITHM)
      .update(token)
      .digest('hex');
    userDB.reset_password_token = hash;

    await this.usersRepository.save(userDB);
    this.emailService.resetPassword(userDB, token);
  }

  async resetPassword(payload: ResetPasswordDto) {
    const tokenHashed = createHash(AuthEnum.HASH_ALGORITHM)
      .update(payload.token)
      .digest('hex');

    const userDB = await this.userService.findByHashedToken(tokenHashed);

    if (userDB.reset_password_token !== tokenHashed) {
      throw new UnauthorizedException('Token incorreto');
    }

    const tokenExpirationDate = new Date(userDB.reset_password_token_time);
    const currentTime = new Date();
    const expirationTime = new Date(
      tokenExpirationDate.getTime() + AuthEnum.EXP_TIME_RESET_PASSWORD,
    );

    if (currentTime > expirationTime) {
      throw new BadRequestException('Tempo expirado');
    }

    if (await bcrypt.compare(payload.password, userDB.password)) {
      throw new BadRequestException('Senha não pode ser igual a anterior');
    }

    this.usersRepository.create({
      ...userDB,
      password: await bcrypt.hash(payload.password, AuthEnum.SALT_ROUND),
    });
  }
}
