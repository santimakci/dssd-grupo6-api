import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectObservation } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectsObservationsRepository {
  constructor(
    @InjectRepository(ProjectObservation)
    private readonly projectsObservationsRepository: Repository<ProjectObservation>,
  ) {}

  findOneById(id: string) {
    return this.projectsObservationsRepository.findOneBy({ id });
  }

  bulkSave(observations: Partial<ProjectObservation>[]) {
    return this.projectsObservationsRepository.save(observations);
  }

  update(id: string, data: Partial<ProjectObservation>) {
    return this.projectsObservationsRepository.update(id, data);
  }

  countUnfinishedByProjectId(reviewId: string) {
    return this.projectsObservationsRepository
      .createQueryBuilder('observation')
      .where('observation.reviewId = :reviewId', { reviewId })
      .andWhere('observation.isFinished IS false')
      .getCount();
  }

  findAllByReviewId(reviewId: string, page: number, limit: number) {
    return this.projectsObservationsRepository
      .createQueryBuilder('observation')
      .where('observation.reviewId = :reviewId', { reviewId })
      .skip(page * limit)
      .take(limit)
      .orderBy('observation.createdAt', 'DESC')
      .getManyAndCount();
  }
}
