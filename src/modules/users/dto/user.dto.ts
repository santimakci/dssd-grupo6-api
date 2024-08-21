import { Exclude, Expose } from 'class-transformer';
import { BaseDto } from 'src/common/dtos/base/base.dto';

export class UserDto extends BaseDto {
  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  position: string;

  @Expose()
  roles: number[];

  @Expose()
  document: string;
}
