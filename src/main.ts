import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.use(cookieParser());

  // CORS configuration
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const allowedOrigins = [
    configService.get<string>('server.clientUrl') || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:5000',
    'https://thich-cung-kieng-server.onrender.com', // Server domain for Swagger
  ];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (Postman, mobile apps, same-origin, Swagger)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // In development, allow all origins for testing
        if (!isProduction) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useLogger(
    configService.get<string>('server.port') === 'production'
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  );
  app.setGlobalPrefix('api/v1');
  // Setup Swagger
  const configSwagger = new DocumentBuilder()
    .setTitle('Thich Cung Kieng API')
    .setDescription(
      `
Welcome to the API documentation for the **Thich Cung Kieng**, built with **NestJS**.

This API powers various features and functionalities of the Thich Cung Kieng application.
---
`,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);
  // Require BOTH headers when the guard is applied. In OpenAPI, putting both
  // schemes inside one security object means they are required together (AND).
  (document as any).security = [{ ApiKeyAuth: [], ApiSecretAuth: [] }];
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs-json',
  });
  await app.listen(configService.get<string>('server.port') || 3000);
}
bootstrap();
