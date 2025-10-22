import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PaginatorDto {
  @ApiProperty({
    description: 'Número de página',
    example: 0,
    required: false,
  })
  @Expose()
  @Optional()
  page: number;

  @ApiProperty({
    description: 'úmero de elementos por página',
    example: 10,
    required: false,
  })
  @Expose()
  @Optional()
  limit: number;

  @Expose()
  total: number;
}
