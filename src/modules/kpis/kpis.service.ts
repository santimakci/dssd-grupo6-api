import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BonitaApiService } from 'src/common/integrations/bonita-api/bonita-api.service';
import { ProjectsRepository } from 'src/repositories/projects.repository';
import { TasksRepository } from 'src/repositories/tasks.repository';

@Injectable()
export class KpisService {
  constructor(
    private readonly configService: ConfigService,
    private readonly bonitaApiService: BonitaApiService,
    private readonly tasksRepository: TasksRepository,
    private readonly projectsRepository: ProjectsRepository,
  ) {}

  async totalCases() {
    const cookie = await this.bonitaApiService.loginBonita();

    const archivedCases = await this.bonitaApiService.listArchivedCases(
      cookie,
      0,
      1000000,
    );
    const openCases = await this.bonitaApiService.listOpenCases(
      cookie,
      0,
      1000000,
    );

    const tasksKpis = await this.bonitaApiService.getTasksKpis(
      cookie,
      this.configService.get<string>('ADMIN_CLOUD_EMAIL'),
      this.configService.get<string>('ADMIN_CLOUD_PASSWORD'),
    );

    const tasksFinishedLocally =
      await this.tasksRepository.countFinishedTasksLocally();

    const tasksPendingLocally =
      await this.tasksRepository.countPendingTasksLocally();

    const topCountries =
      await this.projectsRepository.getTopCountriesWithMostProjects(5);
    console.log('Top 5 countries with most projects:', topCountries);

    return {
      finishedCases: archivedCases.length,
      ongoingCases: openCases.length,
      totalCases: archivedCases.length + openCases.length,
      unTakenTasks: tasksKpis.unTakenTasks,
      pendingTasks: tasksPendingLocally + tasksKpis.pendingTasks,
      finishedTasks: tasksFinishedLocally + tasksKpis.finishedTasks,
      topCountries,
    };
  }
}
