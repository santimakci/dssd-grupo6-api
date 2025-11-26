import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueryPaginationDto } from 'src/common/dtos/pagination/query-pagination.dto';
import { BonitaApiService } from 'src/common/integrations/bonita-api/bonita-api.service';
import { LoginDto } from '../auth/dto/login.dto';
import { TasksRepository } from 'src/repositories/tasks.repository';
import { TaskQueryPaginationDto } from './dtos/task-pagination.dto';
import { User } from 'src/entities';

@Injectable()
export class TasksService {
  constructor(
    private readonly bonitaApiService: BonitaApiService,
    private readonly configService: ConfigService,
    private readonly taskRepository: TasksRepository,
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

  async takeTask(id: string, user: User) {
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
  }
}
