import { MailerService } from '@nestjs-modules/mailer';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

@Injectable()
export class AuthEmailService {
  private logger = new Logger('AuthEmailService');
  constructor(private readonly mailerService: MailerService) {}

  public resetPassword(user, token): Promise<any> {
    return this.mailerService
      .sendMail({
        to: user.email,
        subject: 'Resetar a senha',
        template: 'reset-password',
        context: {
          name: user.name,
          code: token,
        },
      })
      .then(() => {
        this.logger.log(`Email enviado para ${user.name}`);
      })
      .catch((e) => {
        this.logger.error('Erro no envio de email', e);
        throw new InternalServerErrorException(
          'Erro ao enviar email, tente novamente em 30 minutos',
        );
      });
  }
}
