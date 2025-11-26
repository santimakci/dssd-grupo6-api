import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
  Version,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { QueryPaginationDto } from 'src/common/dtos/pagination/query-pagination.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { TaskQueryPaginationDto } from './dtos/task-pagination.dto';

@ApiBearerAuth('jwt')
@ApiTags('tasks')
@Controller('tasks')
@UseGuards(AuthenticationGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({
    summary: 'Lista de tareas paginadas local',
  })
  @Version('1')
  @Get()
  findPaginatedLocal(@Query() query: TaskQueryPaginationDto) {
    return this.tasksService.findPaginated(query);
  }

  @ApiOperation({
    summary:
      'Es v2 para cuando tengas que listar las tareas pasando por Bonita',
  })
  @Version('2')
  @Get()
  findPaginated(@Query() query: TaskQueryPaginationDto) {
    return this.tasksService.findPaginated(query);
  }

  @ApiOperation({
    summary: 'Comprometerse a completar una tarea/ pedido de colaboración',
  })
  @Post(':id/take')
  takeTask(@Param('id') id: string, @Req() { user }) {
    return this.tasksService.takeTask(id, user);
  }
}
