import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ApiTags } from '@nestjs/swagger';
import { QueryPaginationDto } from 'src/common/dtos/pagination/query-pagination.dto';
import { CreateProjectDto } from './dtos/create-project.dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() body: CreateProjectDto) {
    return this.projectsService.createProject(body);
  }

  @Get()
  list(@Query() query: QueryPaginationDto) {
    return this.projectsService.listProjectsPaginated(query);
  }
}
