import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from './base.entity';
import { Project } from './project.entity';

@Entity({
  name: 'ongs',
})
export class Ong extends Base {
  @Column()
  name: string;

  @Column({
    unique: true,
  })
  email: string;

  @ManyToOne(() => Project, (project) => project.ong)
  projects: Project[];
}
