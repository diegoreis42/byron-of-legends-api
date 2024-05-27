import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from './users.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {

    constructor(private userRepository: UsersRepository) { }


    async findOneByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findOneByEmail(email);

        if (!user) {
            throw new NotFoundException(`Email ${email} não encontrado`);
        }

        return user;
    }

    async findByHashedToken(token: string): Promise<User> {

        const user = await this.userRepository.findOneByHashedToken(token);

        if (!user) {
            throw new UnauthorizedException('Token inválido');
        }

        return user;
    }
}
