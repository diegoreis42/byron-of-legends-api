import { NestFactory } from '@nestjs/core';
import { DomainsModule } from './domains/domains.module';

async function bootstrap() {
  const app = await NestFactory.create(DomainsModule);
  await app.listen(3000);
}
bootstrap();
