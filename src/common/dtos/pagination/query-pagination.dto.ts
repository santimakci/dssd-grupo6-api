import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class QueryPaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (Optional)',
  })
  @IsNumber()
  @IsOptional()
  page: number;

  @ApiPropertyOptional({
    description: 'Number of items per page (Optional)',
  })
  @IsNumber()
  @IsOptional()
  limit: number;

  @ApiPropertyOptional({
    description: 'Search term (Optional)',
  })
  @IsOptional()
  search?: string;
}
