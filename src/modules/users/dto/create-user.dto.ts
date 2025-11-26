import { IsEmail, IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'user@example.com',
  })
  @IsEmail()
  @Expose()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'John',
  })
  @Expose()
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Doe',
  })
  @Expose()
  lastName: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'SecurePass123!',
  })
  @Expose()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'IDs de roles asignados al usuario',
    example: [1, 2],
    type: [Number],
  })
  @Expose()
  @IsNotEmpty()
  roles: number[];

  @Expose()
  userBonita: string;
}
