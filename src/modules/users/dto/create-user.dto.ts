import { IsEmail, IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateUserDto {
  @IsEmail()
  @Expose()
  @IsNotEmpty()
  email: string;
  @Expose()
  firstName: string;
  @Expose()
  lastName: string;
  @Expose()
  @IsNotEmpty()
  document: string;
  @Expose()
  @IsNotEmpty()
  role: number[];
}
