import { IsNumber, IsOptional } from 'class-validator';

export class QueryPaginationDto {
  @IsNumber()
  @IsOptional()
  page: number;

  @IsNumber()
  @IsOptional()
  limit: number;
}
