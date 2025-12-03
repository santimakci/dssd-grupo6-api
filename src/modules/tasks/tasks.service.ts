import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueryPaginationDto } from 'src/common/dtos/pagination/query-pagination.dto';
import { BonitaApiService } from 'src/common/integrations/bonita-api/bonita-api.service';
import { LoginDto } from '../auth/dto/login.dto';
import { TasksRepository } from 'src/repositories/tasks.repository';
import { TaskQueryPaginationDto } from './dtos/task-pagination.dto';
import { User } from 'src/entities';
import { ProjectsRepository } from 'src/repositories/projects.repository';
import { parseTsClassToJavaClass } from 'src/common/helpers/parsers/parse-tsclass-to-javaclass';

@Injectable()
export class TasksService {
  constructor(
    private readonly bonitaApiService: BonitaApiService,
    private readonly configService: ConfigService,
    private readonly taskRepository: TasksRepository,
    private readonly projectRepository: ProjectsRepository,
  ) {}

  async findPaginated(query: TaskQueryPaginationDto) {
    try {
      const { projectId = null, privateTask = true } = query;

      if (!projectId) {
        throw new BadRequestException('projectId is required');
      }
      if (privateTask) {
        return this.findPaginatedPrivates(query);
      } else {
        return this.findPaginatedPublic(query);
      }
    } catch (error) {
      throw new BadRequestException(error.message || 'Unknown error occurred');
    }
  }

  async findAssignedTasks(user: User, query: QueryPaginationDto) {
    try {
      const { page = 0, limit = 10 } = query;
      const cookie = await this.bonitaApiService.loginBonita();
      const loginDto: LoginDto = {
        email: this.configService.get<string>('ADMIN_CLOUD_EMAIL'),
        password: this.configService.get<string>('ADMIN_CLOUD_PASSWORD'),
      };
      const response = await this.bonitaApiService.listAssignedTasksFromCloud(
        cookie,
        user.email,
        loginDto.email,
        loginDto.password,
        page,
        limit,
      );
      const results = [];
      for (const task of response.data) {
        const project = await this.projectRepository.getProjectById(
          task.projectId,
        );
        results.push({
          ...task,
          project,
        });
      }
      return {
        data: results,
        total: response.total,
        page: response.page,
        limit: response.limit,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Unknown error occurred');
    }
  }

  async findPaginatedPrivates(query: TaskQueryPaginationDto) {
    const { search = null, page = 0, limit = 10, projectId = null } = query;
    return this.taskRepository.findPaginatedByProject(
      projectId,
      page,
      limit,
      search,
    );
  }

  async findPaginatedPublic(query: TaskQueryPaginationDto) {
    const { search = null, page = 0, limit = 10, projectId = null } = query;
    const loginDto: LoginDto = {
      email: this.configService.get<string>('ADMIN_CLOUD_EMAIL'),
      password: this.configService.get<string>('ADMIN_CLOUD_PASSWORD'),
    };
    const cookie = await this.bonitaApiService.loginBonita();
    return this.bonitaApiService.listTasksFromCloud(
      cookie,
      page,
      limit,
      loginDto,
      projectId,
    );
  }

  async takeTask(id: string, projectId: string, user: User) {
    const cookie = await this.bonitaApiService.loginBonita();
    const loginDto: LoginDto = {
      email: this.configService.get<string>('ADMIN_CLOUD_EMAIL'),
      password: this.configService.get<string>('ADMIN_CLOUD_PASSWORD'),
    };
    await this.bonitaApiService.takeTaskFromCloud(
      id,
      `${user.firstName} ${user.lastName}`,
      user.email,
      loginDto.email,
      loginDto.password,
      cookie,
    );
    await this.countUntakenTasksAndFinishProject(projectId, user);
  }

  async finishTask(id: string, projectId: string, user: User) {
    const localTask = await this.taskRepository.findOne(id);
    if (localTask) {
      await this.taskRepository.save({
        id,
        endDate: new Date(),
        isFinished: true,
      });
    } else {
      const cookie = await this.bonitaApiService.loginBonita();
      const loginDto: LoginDto = {
        email: this.configService.get<string>('ADMIN_CLOUD_EMAIL'),
        password: this.configService.get<string>('ADMIN_CLOUD_PASSWORD'),
      };
      await this.bonitaApiService.finishTaskFromCloud(
        id,
        loginDto.email,
        loginDto.password,
        cookie,
      );
    }
    await this.countPendingTasksAndFinishProject(projectId, user);
  }

  async countUntakenTasksAndFinishProject(projectId: string, user: User) {
    const cookie = await this.bonitaApiService.loginBonita();
    const loginDto: LoginDto = {
      email: this.configService.get<string>('ADMIN_CLOUD_EMAIL'),
      password: this.configService.get<string>('ADMIN_CLOUD_PASSWORD'),
    };
    const response = await this.bonitaApiService.countUntakenTasksByProjectId(
      projectId,
      loginDto.email,
      loginDto.password,
      cookie,
    );
    const project = await this.projectRepository.getProjectById(projectId);
    if (response.total === 0) {
      await this.projectRepository.update(projectId, { canBeFinished: true });
      const tasks = await this.bonitaApiService.listTasks(
        cookie,
        0,
        50,
        project.caseId,
      );
      const javaClassName = parseTsClassToJavaClass(typeof true);
      await this.bonitaApiService.setVariableByCaseId(
        project.caseId,
        'allTaskWasTaken',
        'true',
        javaClassName,
        cookie,
      );
      for (const task of tasks) {
        if (task.name === 'Registrar compromiso con detalle') {
          await this.bonitaApiService.executeTask(task.id, {}, cookie);
        }
      }
    }
  }

  async countPendingTasksAndFinishProject(projectId: string, user: User) {
    const localPending = await this.taskRepository.countPendingByProject(
      projectId,
    );
    const cookie = await this.bonitaApiService.loginBonita();
    const loginDto: LoginDto = {
      email: this.configService.get<string>('ADMIN_CLOUD_EMAIL'),
      password: this.configService.get<string>('ADMIN_CLOUD_PASSWORD'),
    };
    const cloudCount = await this.bonitaApiService.countPendingTasksByProjectId(
      projectId,
      loginDto.email,
      loginDto.password,
      cookie,
    );

    const totalPending = localPending + (cloudCount?.total ?? 0);
    if (totalPending === 0) {
      await this.projectRepository.update(projectId, {
        canBeFinished: true,
      });
      await this.finishProject(projectId);
    }
  }

  async finishProject(projectId: string) {
    try {
      const cookie = await this.bonitaApiService.loginBonita();
      const project = await this.projectRepository.getProjectById(projectId);
      await this.projectRepository.update(projectId, { isFinished: true });
      const tasks = await this.bonitaApiService.listTasks(
        cookie,
        0,
        50,
        project.caseId,
      );
      const javaClassName = parseTsClassToJavaClass(typeof true);
      await this.bonitaApiService.setVariableByCaseId(
        project.caseId,
        'allTasksWereFinished',
        'true',
        javaClassName,
        cookie,
      );
      for (const task of tasks) {
        if (task.name === 'Iniciar compromiso') {
          await this.bonitaApiService.executeTask(task.id, {}, cookie);
        }
      }
    } catch (error) {
      throw new BadRequestException(error.message || 'Unknown error occurred');
    }
  }
}
