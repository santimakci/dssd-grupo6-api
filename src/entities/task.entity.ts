import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from './base.entity';
import { Project } from './project.entity';

@Entity({
  name: 'tasks',
})
export class Task extends Base {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, (project) => project.tasks)
  project: Project;

  @Column({
    type: 'date',
  })
  startDate: Date;

  @Column({
    type: 'date',
  })
  endDate: Date;

  @Column({
    default: false,
  })
  isFinished: boolean;
}
