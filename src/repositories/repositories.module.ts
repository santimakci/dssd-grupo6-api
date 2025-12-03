import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UsersRepository } from 'src/repositories';
import { OngsRepository } from './ongs.repository';
import { ProjectsRepository } from './projects.repository';
import { Ong, Project, Task } from 'src/entities';
import { TasksRepository } from './tasks.repository';
import { ProjectObservation } from 'src/entities/project-observations.entity';
import { ProjectsObservationsRepository } from './project-observations.repository';
import { ProjectReview } from 'src/entities/project-review.entity';
import { ProjectsReviewsRepository } from './project-reviews.repository';

@Module({
  providers: [
    TasksRepository,
    UsersRepository,
    ProjectsRepository,
    OngsRepository,
    ProjectsObservationsRepository,
    ProjectsReviewsRepository,
  ],
  imports: [
    TypeOrmModule.forFeature([
      User,
      Task,
      Project,
      Ong,
      ProjectObservation,
      ProjectReview,
    ]),
  ],
  exports: [
    TasksRepository,
    UsersRepository,
    ProjectsRepository,
    OngsRepository,
    ProjectsObservationsRepository,
    ProjectsReviewsRepository,
  ],
})
export class RepositoriesModule {}
