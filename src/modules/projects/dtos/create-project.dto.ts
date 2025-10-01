import { Expose, Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';

export class CreateProjectDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  ongName: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  ongMail: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  country: string;

  @Expose()
  @IsDateString()
  startDate: Date;

  @Expose()
  @IsDateString()
  endDate: Date;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTaskDto)
  tasks: CreateTaskDto[];
}

export class CreateTaskDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Expose()
  @IsDateString()
  startDate: Date;

  @Expose()
  @IsDateString()
  endDate: Date;
}
