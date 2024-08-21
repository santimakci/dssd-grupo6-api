import { Expose } from 'class-transformer';
import { PaginatorDto } from 'src/common/dtos/pagination/paginator.dto';

export class SearchUserPaginatorDto extends PaginatorDto {
  @Expose()
  search: string;
}
