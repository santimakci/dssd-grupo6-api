import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { BonitaApiModule } from 'src/common/integrations/bonita-api/bonita.module';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService],
  imports: [BonitaApiModule],
})
export class ProjectsModule {}
