import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Environment } from './common/enums/enviorment.enum';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const port = config.get('PORT') || 3000;

  app.enableCors({
    origin: config.get('ALLOWED_ORIGIN') || '*',
  });
  const environment = config.get('ENVIRONMENT') || Environment.DEVELOPMENT;
  // Swagger configuration only for development environment
  if (environment === Environment.DEVELOPMENT) {
    const options = new DocumentBuilder()
      .setTitle('Backend API')
      .setDescription('Backend API Documentation')
      .setVersion('1.0')
      .addServer('http://localhost:3000/', 'Local environment')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'jwt',
      )
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api-docs', app, document);
  }

  // Loggins incoming requests
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      if (!req.path.includes('ping')) {
        console.log(
          `🌐 ${req.method} ${req.path} ${res.statusCode} ${
            Date.now() - start
          }ms`,
        );
      }
    });
    next();
  });
  await app.listen(port);
  console.log(`API running on port: ${port}`);
}
bootstrap();
