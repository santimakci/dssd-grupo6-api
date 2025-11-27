import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  Version,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { TaskQueryPaginationDto } from './dtos/task-pagination.dto';
import { QueryPaginationDto } from 'src/common/dtos/pagination/query-pagination.dto';

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
    summary: 'Lista de tareas asignadas al usuario',
  })
  @Version('1')
  @Get('assigned')
  findAssignedTasks(@Req() { user }, @Query() query: QueryPaginationDto) {
    return this.tasksService.findAssignedTasks(user, query);
  }

  @Version('1')
  @ApiOperation({
    summary: 'Comprometerse a completar una tarea/ pedido de colaboración',
  })
  @Post(':id/take')
  takeTask(
    @Param('id') id: string,
    @Body() body: { projectId: string },
    @Req() { user },
  ) {
    return this.tasksService.takeTask(id, body.projectId, user);
  }

  @ApiOperation({
    summary: 'Marcar tarea como finalizada',
  })
  @Post(':id/finish')
  finishTask(
    @Param('id') id: string,
    @Body() body: { projectId: string },
    @Req() { user },
  ) {
    return this.tasksService.finishTask(id, body.projectId, user);
  }
}
