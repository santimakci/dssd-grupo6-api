import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectReview } from 'src/entities/project-review.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectsReviewsRepository {
  constructor(
    @InjectRepository(ProjectReview)
    private readonly projectsReviewsRepository: Repository<ProjectReview>,
  ) {}

  save(review: Partial<ProjectReview>) {
    return this.projectsReviewsRepository.save(review);
  }

  findAllByProjectId(projectId: string, page: number, limit: number) {
    return this.projectsReviewsRepository
      .createQueryBuilder('review')
      .where('review.projectId = :projectId', { projectId })
      .orderBy('review.createdAt', 'DESC')
      .skip(page * limit)
      .take(limit)
      .getManyAndCount();
  }
}
