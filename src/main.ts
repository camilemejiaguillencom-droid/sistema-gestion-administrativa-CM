import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import hbs from 'hbs';
import { join } from 'path';
import { AppModule } from './app.module';

let cachedServer: any;

export async function createApp(): Promise<NestExpressApplication> {
  const isVercel = Boolean(process.env.VERCEL);
  const dataDir = isVercel ? '/tmp' : join(__dirname, '..', 'data');
  if (!existsSync(dataDir)) {
    try {
      mkdirSync(dataDir, { recursive: true });
    } catch {
      // Ignorar en entornos de solo lectura como Vercel
    }
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const root = isVercel ? process.cwd() : join(__dirname, '..');
  app.useStaticAssets(join(root, 'public'));
  app.setBaseViewsDir(join(root, 'views'));
  app.setViewEngine('hbs');
  app.set('view options', { layout: 'layout' });
  hbs.registerHelper('eq', (a, b) => a === b);
  hbs.registerHelper('money', (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(n) || 0),
  );
  app.useBodyParser('urlencoded', { extended: true });
  return app;
}

async function bootstrap() {
  const app = await createApp();
  await app.listen(3000);
  console.log('http://localhost:3000');
}

// Iniciar servidor tradicional en desarrollo local
if (!process.env.VERCEL) {
  bootstrap();
}

// Handler serverless para Vercel
export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    const app = await createApp();
    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }

  return new Promise<void>((resolve, reject) => {
    res.on('finish', () => resolve());
    res.on('close', () => resolve());
    res.on('error', (err: any) => reject(err));
    cachedServer(req, res);
  });
}
