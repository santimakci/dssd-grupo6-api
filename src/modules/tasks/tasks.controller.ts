import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { QueryPaginationDto } from 'src/common/dtos/pagination/query-pagination.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/guards/authentication.guard';

@ApiBearerAuth('jwt')
@ApiTags('tasks')
@Controller('tasks')
@UseGuards(AuthenticationGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findPaginated(@Query() query: QueryPaginationDto) {
    return this.tasksService.findPaginated(query);
  }
}
