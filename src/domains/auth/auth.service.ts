import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { AuthEmailService } from 'src/infra/email/auth-email.service';
import { IUser } from '../users/user.interface';
import { UsersRepository } from '../users/users.repository';
import { AuthEnum } from './auth.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private emailService: AuthEmailService,
  ) { }

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

  async requestResetPassword(user) {
    const token = randomUUID();
    const hash = createHash(AuthEnum.HASH_ALGORITHM)
      .update(token)
      .digest('hex');
    let userDB = await this.usersRepository.findOneByEmail(user.email);
    userDB.reset_password_token = hash;

    await this.usersRepository.save(userDB);
    this.emailService.resetPassword(user, token);
  }

  async resetPassword(user: IUser, token: string) {
    const userDB = await this.usersRepository.findOneByEmail(user.email);

    if (!userDB) {
      throw new NotFoundException(`Usuário ${user.email} não encontrado`);
    }

    const hash = createHash(AuthEnum.HASH_ALGORITHM)
      .update(token)
      .digest('hex');

    if (userDB.reset_password_token !== hash) {
      throw new UnauthorizedException('Token incorreto');
    }

    const tokenExpirationDate = new Date(userDB.reset_password_token_time);
    const currentTime = new Date();
    const expirationTime = new Date(
      tokenExpirationDate.getTime() + AuthEnum.EXP_TIME_RESET_PASSWD,
    );

    if (currentTime > expirationTime) {
      throw new BadRequestException('Tempo expirado');
    }

    if (await bcrypt.compare(user.password, userDB.password)) {
      throw new BadRequestException('Senha não pode ser igual a anterior');
    }

    this.usersRepository.create({
      ...userDB,
      password: await bcrypt.hash(user.password, AuthEnum.SALT_ROUND),
    });
  }
}
