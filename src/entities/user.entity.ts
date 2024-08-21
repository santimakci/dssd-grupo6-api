import { Column, Entity } from 'typeorm';
import { Base } from './base.entity';
import { UserRole } from 'src/common/enums/user-role.enum';

@Entity({
  name: 'users',
})
export class User extends Base {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({
    nullable: false,
    select: false,
  })
  password: string;

  @Column({
    nullable: true,
  })
  document: string;

  @Column({
    nullable: true,
  })
  position: string;

  @Column('int', { array: true, default: [UserRole.ADMIN] })
  roles: number[];
}
