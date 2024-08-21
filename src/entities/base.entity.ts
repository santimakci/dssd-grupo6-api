import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({
  name: 'Base',
  synchronize: false,
})
export class Base extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    default: null,
    nullable: false,
    type: Date,
  })
  createdAt: Date;

  @UpdateDateColumn({
    default: null,
    nullable: true,
    type: Date,
  })
  updatedAt?: Date;

  @DeleteDateColumn({
    default: null,
    nullable: true,
    type: Date,
  })
  deletedAt?: Date;

  @Column({
    nullable: true,
  })
  createdById?: string;

  @ManyToOne(() => User, (user: User) => user.id, {
    nullable: true,
  })
  @JoinColumn({
    name: 'createdById',
  })
  createdBy?: User;

  @Column({
    nullable: true,
  })
  updatedById?: string;

  @ManyToOne(() => User, (user: User) => user.id, {
    nullable: true,
  })
  @ManyToOne(() => User, (user: User) => user.id, { nullable: true })
  @JoinColumn({
    name: 'updatedById',
  })
  updatedBy: User;

  @Column({
    nullable: true,
  })
  deletedById?: string;

  @ManyToOne(() => User, (user: User) => user.id)
  @JoinColumn({
    name: 'deletedById',
  })
  deletedBy: User;

  @Column({
    default: true,
    nullable: true,
  })
  isActive: boolean;
}
