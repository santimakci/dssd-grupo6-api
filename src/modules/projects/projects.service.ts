import { BadRequestException, Injectable } from '@nestjs/common';
import { BonitaApiService } from 'src/common/integrations/bonita-api/bonita-api.service';
import { parseTsClassToJavaClass } from 'src/common/helpers/parsers/parse-tsclass-to-javaclass';
import { ProjectsRepository } from 'src/repositories/projects.repository';
import { CreateProjectDto } from './dtos/create-project.dto';
import { QueryPaginationDto } from 'src/common/dtos/pagination/query-pagination.dto';
import { TasksRepository } from 'src/repositories/tasks.repository';
import { OngsService } from '../ongs/ongs.service';
import { TasksService } from '../tasks/tasks.service';
import { TaskQueryPaginationDto } from '../tasks/dtos/task-pagination.dto';
import { User } from 'src/entities';
import { UsersRepository } from 'src/repositories';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly bonitaApiService: BonitaApiService,
    private readonly projectsRepository: ProjectsRepository,
    private readonly tasksRepository: TasksRepository,
    private readonly ongsRepository: OngsService,
    private readonly tasksService: TasksService,
    private readonly userRepository: UsersRepository,
  ) {}

  async createProject(body: CreateProjectDto, user: User) {
    const ong = await this.ongsRepository.findOrCreate({
      name: body.ongName,
      email: body.ongMail,
    });
    const { privateTasks, publicTasks } = this.separateTask(body);
    const project = await this.projectsRepository.save({
      name: body.name,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      country: body.country,
      ongId: ong.id,
    });
    const response = await this.createProjectInBonita({
      ...body,
      tasks: publicTasks,
      projectId: project.id,
    });
    project.caseId = response.caseId;
    await this.projectsRepository.save(project);

    const tasks = privateTasks.map((task) => ({
      ...task,
      projectId: project.id,
    }));
    await this.tasksRepository.bulkSave(tasks);
    // Bonita tiene problemitas (como yo) para ejecutar las tareas inmediatamente despues de crear el proceso
    //  por eso le pongo un timeout de 2 segundos
    setTimeout(async () => {
      await this.executeTasksInitialization(response.caseId, user);
    }, 2000);
    return project;
    // await this.executeTasksInitialization(response.caseId, user);
  }

  private separateTask(body: CreateProjectDto) {
    // iterate tasks if isPrivate is true make and array, if not make another array
    const privateTasks = [];
    const publicTasks = [];
    for (const task of body.tasks) {
      if (task.isPrivate) {
        privateTasks.push(task);
      } else {
        publicTasks.push(task);
      }
    }
    return { privateTasks, publicTasks };
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

  async createProjectInBonita(
    body: CreateProjectDto & { projectId: string },
  ): Promise<{ message: string; caseId: number }> {
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
      // Esto setea todas las variables en la instancia
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
      await this.setEmailsForProcess(processInstanceId, cookie);
      return { message: 'Bonita process initiated', caseId: processInstanceId };
    } catch (error) {
      throw new BadRequestException(error.message || 'Unknown error occurred');
    }
  }

  private async setEmailsForProcess(
    processInstanceId: number,
    cookie: string[],
  ) {
    const users = await this.userRepository.findByRoles([
      UserRole.ONG_COLLABORATOR,
    ]);
    let emails = '';
    for (const user of users) {
      emails = emails ? `${emails},${user.email}` : user.email;
    }
    const javaClassName = parseTsClassToJavaClass(typeof emails);
    await this.bonitaApiService.setVariableByCaseId(
      processInstanceId,
      'emailsTo',
      emails,
      javaClassName,
      cookie,
    );
  }

  /* 
  
  Steps:
  1- Get user by userId
  3- Get bonita user info 
  4- get tasks by caseId
  5- for each task assign to user
  6- Execute tasks
  7- end
  */
  async executeTasksInitialization(caseId: number, user: User) {
    try {
      const cookie = await this.bonitaApiService.loginBonita();
      const users = await this.bonitaApiService.listUsersBonita(
        cookie,
        0,
        50,
        user.userBonita,
      );
      const bonitaUser = users.find((u) => u.userName === user.userBonita);
      if (!bonitaUser) {
        throw new BadRequestException('Bonita user not found');
      }
      const tasks = await this.bonitaApiService.listTasks(
        cookie,
        0,
        50,
        caseId,
      );

      for (const task of tasks) {
        await this.bonitaApiService.executeTask(task.id, {}, cookie);
      }
    } catch (error) {
      throw new BadRequestException(
        'Error executing tasks initialization: ' + (error.message || error),
      );
    }
  }

  async listTasksByProject(projectId: string, query: TaskQueryPaginationDto) {
    return this.tasksService.findPaginated({
      projectId,
      ...query,
    });
  }
}
