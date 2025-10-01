import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Base } from './base.entity';
import { Task } from './task.entity';
import { Ong } from './ong.entity';

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

  @Column()
  ongId: string;

  @ManyToOne(() => Ong, (ong) => ong.projects)
  ong: Ong;
}
