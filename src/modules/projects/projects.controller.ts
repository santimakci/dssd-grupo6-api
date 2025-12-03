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
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueryPaginationDto } from 'src/common/dtos/pagination/query-pagination.dto';
import { CreateProjectDto } from './dtos/create-project.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { TaskQueryPaginationDto } from '../tasks/dtos/task-pagination.dto';
import { CreateProjectObservationDto } from './dtos/create-project-observations.dto';

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
    @Req() { user },
    @Body(
      new ValidationPipe({
        transform: true,
      }),
    )
    body: CreateProjectDto,
  ) {
    return this.projectsService.createProject(body, user);
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

  @ApiOperation({ summary: 'Finalizar proyecto' })
  @Post('/:projectId/finish')
  finishProject(@Param('projectId') projectId: string) {
    return this.projectsService.finishProject(projectId);
  }

  @ApiOperation({ summary: 'Crear observaciones para un proyecto' })
  @Post('/:projectId/observations')
  @ApiBody({ type: CreateProjectObservationDto })
  createObservations(
    @Param('projectId') projectId: string,
    @Req() { user },
    @Body(
      new ValidationPipe({
        transform: true,
      }),
    )
    body: CreateProjectObservationDto,
  ) {
    return this.projectsService.createObservations(projectId, body, user);
  }

  @ApiOperation({ summary: 'Listado de reviews' })
  @Get(':projectId/reviews')
  listReviews(
    @Param('projectId') projectId: string,
    @Query() query: QueryPaginationDto,
  ) {
    return this.projectsService.listReviewsByProject(projectId, query);
  }

  @ApiOperation({ summary: 'Listado de observations' })
  @Get('reviews/:reviewId/observations/')
  listObservations(
    @Param('reviewId') reviewId: string,
    @Query() query: QueryPaginationDto,
  ) {
    return this.projectsService.listObservationsByReview(reviewId, query);
  }

  @ApiOperation({ summary: 'Marcar una observación como finalizada' })
  @Post('/observations/:observationId/finish')
  finishObservation(@Param('observationId') observationId: string) {
    return this.projectsService.finishObservation(observationId);
  }
}
