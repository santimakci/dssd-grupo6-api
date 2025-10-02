import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UsersRepository } from 'src/repositories';
import { OngsRepository } from './ongs.repository';
import { ProjectsRepository } from './projects.repository';
import { Ong, Project, Task } from 'src/entities';
import { TasksRepository } from './tasks.repository';

@Module({
  providers: [
    TasksRepository,
    UsersRepository,
    ProjectsRepository,
    OngsRepository,
  ],
  imports: [TypeOrmModule.forFeature([User, Task, Project, Ong])],
  exports: [
    TasksRepository,
    UsersRepository,
    ProjectsRepository,
    OngsRepository,
  ],
})
export class RepositoriesModule {}
