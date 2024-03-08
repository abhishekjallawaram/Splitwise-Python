import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import * as csurf from 'csurf';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('cert/key.pem'),
    cert: fs.readFileSync('cert/cert.pem'),
  };

  const config = new DocumentBuilder()
    .setTitle('681 Final Project APIs')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .build();

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });
  app.enableCors();
  // app.use(csurf());
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe());

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}

bootstrap();
