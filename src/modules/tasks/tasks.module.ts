import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { BonitaApiModule } from 'src/common/integrations/bonita-api/bonita.module';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
  imports: [RepositoriesModule, BonitaApiModule],
  exports: [TasksService],
})
export class TasksModule {}
