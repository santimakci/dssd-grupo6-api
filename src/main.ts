import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const port = 3000;
  app.enableCors({
    origin: '*',
  });

  const options = new DocumentBuilder()
    .setTitle('Backend API')
    .setDescription('Backend API Documentation')
    .setVersion('1.0')
    .addServer('http://localhost:3000/', 'Local environment')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);
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
