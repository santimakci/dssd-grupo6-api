import { BadRequestException, Injectable } from '@nestjs/common';
import { BonitaApiService } from 'src/common/integrations/bonita-api/bonita-api.service';
import { parseTsClassToJavaClass } from 'src/common/helpers/parsers/parse-tsclass-to-javaclass';
import { ProjectsRepository } from 'src/repositories/projects.repository';
import { CreateProjectDto } from './dtos/create-project.dto';
import { QueryPaginationDto } from 'src/common/dtos/pagination/query-pagination.dto';
import { TasksRepository } from 'src/repositories/tasks.repository';
import { OngsRepository } from 'src/repositories/ongs.repository';
import { OngsService } from '../ongs/ongs.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly bonitaApiService: BonitaApiService,
    private readonly projectsRepository: ProjectsRepository,
    private readonly tasksRepository: TasksRepository,
    private readonly ongsRepository: OngsService,
  ) {}

  async createProject(body: CreateProjectDto) {
    const ong = await this.ongsRepository.findOrCreate({
      name: body.ongName,
      email: body.ongMail,
    });
    const project = await this.projectsRepository.save({
      name: body.name,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      country: body.country,
      ongId: ong.id,
    });
    const tasks = body.tasks.map((task) => ({
      ...task,
      projectId: project.id,
    }));
    await this.tasksRepository.bulkSave(tasks);
    await this.createProjectInBonita(body);
    return project;
  }

  async listProjectsPaginated(query: QueryPaginationDto) {
    const { search = null, page = 0, limit = 10 } = query;
    const [projects, total] = await this.projectsRepository.findAllPagination(
      page,
      limit,
      search,
    );
    return {
      data: projects,
      total,
      page,
      limit,
    };
  }

  async createProjectInBonita(body: CreateProjectDto) {
    try {
      const cookie = await this.bonitaApiService.loginBonita();
      /* TODO: desharcodear el nombre del proceso ponerlo en el .env o en un enum o en la base de datos */
      const processId = await this.bonitaApiService.getProcessIdByName(
        'Proceso de creación de proyecto',
        cookie,
      );
      if (!processId) {
        throw new BadRequestException('Bonita process not found');
      }

      const processInstanceId = await this.bonitaApiService.initiateProcessById(
        processId,
        cookie,
      );
      try {
        for (const [key, value] of Object.entries(body)) {
          if (Array.isArray(value)) {
            body[key] = JSON.stringify(value);
          }
          const javaClassName = parseTsClassToJavaClass(typeof body[key]);
          await this.bonitaApiService.setVariableByCaseId(
            processInstanceId,
            key,
            body[key],
            javaClassName,
            cookie,
          );
        }
      } catch (error) {
        await this.bonitaApiService.deleteInstanceById(
          processInstanceId,
          cookie,
        );
        throw new BadRequestException(
          'Error setting process variables: ' + (error.message || error),
        );
      }
      return { message: 'Bonita process initiated', caseId: processInstanceId };
    } catch (error) {
      throw new BadRequestException(error.message || 'Unknown error occurred');
    }
  }
}
