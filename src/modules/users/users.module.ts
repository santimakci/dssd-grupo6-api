import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from 'src/repositories';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  imports: [TypeOrmModule.forFeature([User])],
})
export class UsersModule {}
