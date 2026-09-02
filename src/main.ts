import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import * as hbs from 'hbs';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const dataDir = join(__dirname, '..', 'data');
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const root = join(__dirname, '..');
  app.useStaticAssets(join(root, 'public'));
  app.setBaseViewsDir(join(root, 'views'));
  app.setViewEngine('hbs');
  app.set('view options', { layout: 'layout' });
  hbs.registerHelper('eq', (a, b) => a === b);
  hbs.registerHelper('money', (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(n) || 0),
  );
  app.useBodyParser('urlencoded', { extended: true });
  await app.listen(3000);
  console.log('http://localhost:3000');
}
bootstrap();
