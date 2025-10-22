import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class TasksRepository {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  save(data: Partial<Task>) {
    return this.tasksRepository.save(data);
  }

  bulkSave(data: Partial<Task>[]) {
    return this.tasksRepository.save(data);
  }

  findOne(id: string) {
    return this.tasksRepository.findOne({ where: { id } });
  }

  findAllPagination(page: number, limit: number, search: string) {
    const query = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .orderBy('task.createdAt', 'DESC')
      .skip(page * limit)
      .take(limit);

    if (search) {
      query.where('task.name LIKE :search OR project.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    return query.getManyAndCount();
  }
}
