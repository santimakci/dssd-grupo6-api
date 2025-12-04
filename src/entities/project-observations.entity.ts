import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from './base.entity';
import { Project } from './project.entity';
import { ProjectReview } from './project-review.entity';

@Entity({
  name: 'project_observations',
})
export class ProjectObservation extends Base {
  @Column()
  observation: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  endDate: Date;

  @Column()
  reviewId: string;

  @ManyToOne(
    () => ProjectReview,
    (projectReview) => projectReview.projectObservations,
  )
  review: ProjectReview;

  @Column({
    comment: 'Id de instancia de bonita',
    nullable: true,
  })
  caseId: number;

  @Column({
    default: false,
  })
  isFinished: boolean;
}
