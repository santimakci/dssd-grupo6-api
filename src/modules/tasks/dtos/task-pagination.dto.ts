import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { QueryPaginationDto } from 'src/common/dtos/pagination/query-pagination.dto';
import { transformStringToBoolean } from 'src/common/helpers/parsers/parse-string-to-boolean';

export class TaskQueryPaginationDto extends QueryPaginationDto {
  @ApiPropertyOptional({
    description: 'Project ID',
  })
  @IsOptional()
  projectId?: string;

  @Expose()
  @Transform(transformStringToBoolean)
  @IsOptional()
  privateTask: boolean;
}
