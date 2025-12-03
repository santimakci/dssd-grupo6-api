import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Base } from './base.entity';
import { Task } from './task.entity';
import { Ong } from './ong.entity';
import { ProjectReview } from './project-review.entity';

@Entity({
  name: 'projects',
})
export class Project extends Base {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  country: string;

  @Column({
    type: 'date',
  })
  startDate: Date;

  @Column({
    type: 'date',
  })
  endDate: Date;

  @OneToMany(() => Task, (task) => task.project, { cascade: true })
  tasks: Task[];

  @OneToMany(() => ProjectReview, (projectReview) => projectReview.project, {
    cascade: true,
  })
  reviews: ProjectReview[];

  @Column()
  ongId: string;

  @ManyToOne(() => Ong, (ong) => ong.projects)
  ong: Ong;

  @Column({
    comment: 'Id de instancia de bonita',
    nullable: true,
  })
  caseId: number;

  @Column({
    default: false,
  })
  isFinished: boolean;

  @Column({
    default: false,
  })
  canBeFinished: boolean;
}
