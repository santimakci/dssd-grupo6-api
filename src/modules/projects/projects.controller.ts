import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueryPaginationDto } from 'src/common/dtos/pagination/query-pagination.dto';
import { CreateProjectDto } from './dtos/create-project.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { TaskQueryPaginationDto } from '../tasks/dtos/task-pagination.dto';

@ApiBearerAuth('jwt')
@ApiTags('projects')
@Controller('projects')
@UseGuards(AuthenticationGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiOperation({ summary: 'Crear un nuevo proyecto' })
  @ApiBody({ type: CreateProjectDto })
  @Post()
  create(
    @Body(
      new ValidationPipe({
        transform: true,
      }),
    )
    body: CreateProjectDto,
  ) {
    return this.projectsService.createProject(body);
  }

  @ApiOperation({ summary: 'Lista de proyectos paginada' })
  @Get()
  list(@Query() query: QueryPaginationDto) {
    return this.projectsService.listProjectsPaginated(query);
  }

  @ApiOperation({ summary: 'Listado de tareas por proyecto' })
  @Get('/:projectId/tasks')
  listTasksByProject(
    @Query(
      new ValidationPipe({
        transform: true,
      }),
    )
    query: TaskQueryPaginationDto,
    @Param('projectId') projectId: string,
  ) {
    return this.projectsService.listTasksByProject(projectId, query);
  }
}
