import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [RepositoriesModule],
})
export class UsersModule {}
