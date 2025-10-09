import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/modules/users/users.service';

// Script to create an admin user from the command line.
// Create admin with custom values:
// npm run create-admin -- user@example.com password Name LastName Document

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const args = process.argv.slice(2);
  const email = args[0] || 'admin@example.com';
  const password = args[1] || 'password';
  const firstName = args[2] || 'Admin';
  const lastName = args[3] || 'User';
  const document = args[4] || '00000000';

  try {
    const dto = {
      email,
      firstName,
      lastName,
      document,
      role: [1],
    };
    // UsersService.create uses the document as the default password and hashes it.
    // So we temporarily set dto.document to the provided password when creating.
    dto.document = password;

    const user = await usersService.create(dto as any);
    console.log('Admin user created:', user);
  } catch (error) {
    console.error(
      'Error creating admin user:',
      error?.response || error?.message || error,
    );
  } finally {
    await app.close();
  }
}

bootstrap();
