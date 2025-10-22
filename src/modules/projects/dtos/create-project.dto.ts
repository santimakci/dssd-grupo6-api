import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Evaluación del sitio' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Inspeccionar el área para la instalación de paneles solares',
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '2023-02-01' })
  @Expose()
  @IsDateString()
  startDate: Date;

  @ApiProperty({ example: '2023-02-15' })
  @Expose()
  @IsDateString()
  endDate: Date;
}

export class CreateProjectDto {
  @ApiProperty({ example: 'Proyecto de Energía Solar' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'ONG Solar para Todos' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  ongName: string;

  @ApiProperty({ example: 'contact@ongsolar.org' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  ongMail: string;

  @ApiProperty({
    example: 'Instalación de paneles solares en comunidades rurales',
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Argentina' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: '2023-01-01' })
  @Expose()
  @IsDateString()
  startDate: Date;

  @ApiProperty({ example: '2023-12-31' })
  @Expose()
  @IsDateString()
  endDate: Date;

  @ApiProperty({ type: [CreateTaskDto] })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTaskDto)
  tasks: CreateTaskDto[];
}
