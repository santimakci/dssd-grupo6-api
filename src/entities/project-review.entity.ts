import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Base } from './base.entity';
import { Project } from './project.entity';
import { ProjectObservation } from './project-observations.entity';
import { ReviewsStatus } from 'src/common/enums/reviews-status.enum';

@Entity({
  name: 'project_reviews',
})
export class ProjectReview extends Base {
  @Column({
    type: 'date',
    nullable: true,
  })
  endDate: Date;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, (project) => project.reviews)
  project: Project;

  @Column({
    comment: 'Id de instancia de bonita',
    nullable: true,
  })
  caseId: number;

  @Column({
    default: false,
  })
  isFinished: boolean;

  @OneToMany(
    () => ProjectObservation,
    (projectObservation) => projectObservation.projectReview,
  )
  projectObservations: ProjectObservation[];

  @Column({
    type: 'enum',
    enum: ReviewsStatus,
    default: ReviewsStatus.PENDING,
  })
  status: string;
}
