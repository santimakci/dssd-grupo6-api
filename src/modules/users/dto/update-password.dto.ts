import { Expose } from 'class-transformer';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Nueva contraseña del usuario',
    example: 'newPassword123',
    minLength: 6,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Confirmación de la nueva contraseña',
    example: 'newPassword123',
    minLength: 6,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  repeatPassword: string;
}
