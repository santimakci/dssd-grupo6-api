import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { BonitaApiModule } from 'src/common/integrations/bonita-api/bonita.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { OngsModule } from '../ongs/ongs.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService],
  imports: [BonitaApiModule, RepositoriesModule, OngsModule, TasksModule],
})
export class ProjectsModule {}
