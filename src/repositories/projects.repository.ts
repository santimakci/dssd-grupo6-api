import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectsRepository {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
  ) {}

  getProjectById(id: string) {
    return this.projectsRepository.findOne({
      where: { id },
      relations: ['ong'],
    });
  }

  create(data: Partial<Project>) {
    return this.projectsRepository.create(data);
  }

  save(data: Partial<Project>) {
    return this.projectsRepository.save(data);
  }

  findAllPagination(page: number, limit: number, search: string) {
    const query = this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.tasks', 'task')
      .leftJoinAndSelect('project.ong', 'ong')
      .orderBy('project.createdAt', 'DESC')
      .skip(page * limit)
      .take(limit);

    if (search) {
      query.where(
        'project.name LIKE :search OR project.description LIKE :search',
        { search: `%${search}%` },
      );
    }

    return query.getManyAndCount();
  }
}
