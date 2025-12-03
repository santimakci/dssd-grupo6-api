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
import { ProjectsObservationsRepository } from 'src/repositories/project-observations.repository';
import { ProjectsReviewsRepository } from 'src/repositories/project-reviews.repository';
import { CreateProjectObservationDto } from './dtos/create-project-observations.dto';
import { ReviewsStatus } from 'src/common/enums/reviews-status.enum';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly bonitaApiService: BonitaApiService,
    private readonly projectsRepository: ProjectsRepository,
    private readonly tasksRepository: TasksRepository,
    private readonly ongsRepository: OngsService,
    private readonly tasksService: TasksService,
    private readonly userRepository: UsersRepository,
    private readonly projectsObservationsRepository: ProjectsObservationsRepository,
    private readonly projectsReviewsRepository: ProjectsReviewsRepository,
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
      createdById: user.id,
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
      createdById: user.id,
      projectId: project.id,
    }));
    await this.tasksRepository.bulkSave(tasks);
    // await this.executeTasksInitialization(response.caseId, user);
    if (publicTasks.length === 0) {
      this.startProjectImmediately(project.caseId);
    }
    return project;
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

  /* **
    Si todas las tareas son tomadas por la ONG creadora el proyecto no necesita esperar que se registren los compromisos
    Así que directamente setea que no hay tareas sin tomar y ejecuta para pasar a la siguiente tarea del proceso
  */
  async startProjectImmediately(caseId: number) {
    try {
      const cookie = await this.bonitaApiService.loginBonita();
      let tasks = await this.bonitaApiService.listTasks(cookie, 0, 50, caseId);
      const javaClassName = parseTsClassToJavaClass(typeof true);
      await this.bonitaApiService.setVariableByCaseId(
        caseId,
        'allTaskWasTaken',
        'true',
        javaClassName,
        cookie,
      );

      for (const task of tasks) {
        // necesito esperar que apareza la tasks id con name Registrar compromiso con detalle y est[e en en estado ready para poder ejecutarla
        // si no aparece espero 2 segundos y vuelvo a consultar las tareas
        if (
          task.name !== 'Registrar compromiso con detalle' ||
          task.state !== 'ready'
        ) {
          let found = false;
          for (let i = 0; i < 5; i++) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            tasks = await this.bonitaApiService.listTasks(
              cookie,
              0,
              50,
              caseId,
            );
            const taskCheck = tasks.find(
              (t) =>
                t.name === 'Registrar compromiso con detalle' &&
                t.state === 'ready',
            );
            if (taskCheck) {
              found = true;
              await this.bonitaApiService.executeTask(taskCheck.id, {}, cookie);
            }
          }
          if (!found) {
            throw new BadRequestException(
              'Task "Registrar compromiso con detalle" not found or not ready',
            );
          }
        }
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

  async finishProject(projectId: string) {
    try {
      const cookie = await this.bonitaApiService.loginBonita();
      const project = await this.projectsRepository.getProjectById(projectId);

      const tasks = await this.bonitaApiService.listTasks(
        cookie,
        0,
        50,
        project.caseId,
      );

      for (const task of tasks) {
        if (task.name === 'Finalizar proyecto') {
          await this.bonitaApiService.executeTask(task.id, {}, cookie);
        }
      }
    } catch (error) {
      throw new BadRequestException(error.message || 'Unknown error occurred');
    }
  }

  async createObservations(
    projectId: string,
    body: CreateProjectObservationDto,
    user: User,
  ) {
    try {
      const project = await this.projectsRepository.getProjectById(projectId);
      if (!project) {
        throw new BadRequestException('Project not found');
      }
      const cookie = await this.bonitaApiService.loginBonita();
      /* TODO: desharcodear el nombre del proceso ponerlo en el .env o en un enum o en la base de datos */
      const processId = await this.bonitaApiService.getProcessIdByName(
        'Proceso de ofrecimiento de compromiso',
        cookie,
      );
      if (!processId) {
        throw new BadRequestException('Bonita process not found');
      }
      const processInstanceId = await this.bonitaApiService.initiateProcessById(
        processId,
        cookie,
      );

      const review = await this.projectsReviewsRepository.save({
        projectId: project.id,
        caseId: processInstanceId,
        isFinished: false,
        createdById: user.id,
      });

      const observations = body.observations.map((observation) => ({
        observation,
        reviewId: review.id,
        isFinished: false,
        createdById: user.id,
      }));
      return this.projectsObservationsRepository.bulkSave(observations);
    } catch (error) {
      throw new BadRequestException(
        'Error creating project observations: ' + (error.message || error),
      );
    }
  }

  async listReviewsByProject(projectId: string, query: QueryPaginationDto) {
    const { page = 0, limit = 10 } = query;
    const [reviews, total] =
      await this.projectsReviewsRepository.findAllByProjectId(
        projectId,
        page,
        limit,
      );
    return {
      data: reviews,
      total,
      page,
      limit,
    };
  }

  async listObservationsByReview(reviewId: string, query: QueryPaginationDto) {
    const { page = 0, limit = 10 } = query;
    const [observations, total] =
      await this.projectsObservationsRepository.findAllByReviewId(
        reviewId,
        page,
        limit,
      );
    return {
      data: observations,
      total,
      page,
      limit,
    };
  }

  async finishObservation(observationId: string) {
    const observation = await this.projectsObservationsRepository.findOneById(
      observationId,
    );
    if (!observation) {
      throw new BadRequestException('Observation not found');
    }
    if (observation.isFinished) {
      throw new BadRequestException('Observation already finished');
    }
    await this.projectsObservationsRepository.update(observation.id, {
      isFinished: true,
      endDate: new Date(),
    });
    const pendingObservations =
      await this.projectsObservationsRepository.countUnfinishedByProjectId(
        observation.reviewId,
      );
    if (pendingObservations === 0) {
      await this.projectsReviewsRepository.save({
        id: observation.reviewId,
        isFinished: true,
        status: ReviewsStatus.COMPLETED,
        endDate: new Date(),
      });
    }
    return observation;
  }
}
