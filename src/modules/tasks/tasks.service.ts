import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueryPaginationDto } from 'src/common/dtos/pagination/query-pagination.dto';
import { BonitaApiService } from 'src/common/integrations/bonita-api/bonita-api.service';
import { LoginDto } from '../auth/dto/login.dto';
import { TasksRepository } from 'src/repositories/tasks.repository';

@Injectable()
export class TasksService {
  constructor(
    private readonly bonitaApiService: BonitaApiService,
    private readonly configService: ConfigService,
    private readonly taskRepository: TasksRepository,
  ) {}

  async findPaginated(query: QueryPaginationDto) {
    try {
      const { search = null, page = 0, limit = 10, projectId = null } = query;
      if (!projectId) {
        throw new BadRequestException('projectId is required');
      }
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
    } catch (error) {
      console.error('Error fetching paginated tasks:', error);
      throw error;
    }
  }
}
