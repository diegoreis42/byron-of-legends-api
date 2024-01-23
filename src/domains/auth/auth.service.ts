import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { IUser } from '../users/user.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOneByEmail(email);
    if (user && user.password === password) {
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
}
