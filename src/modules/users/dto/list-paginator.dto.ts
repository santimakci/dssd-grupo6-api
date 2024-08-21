import { Expose, Type } from 'class-transformer';
import { UserDto } from './user.dto';
import { PaginatorDto } from 'src/common/dtos/pagination/paginator.dto';

export class ListPaginatorDto extends PaginatorDto {
  @Expose()
  @Type(() => UserDto)
  data: UserDto[];

  constructor(data: UserDto[], count: number, limit: number, page: number) {
    super();
    this.data = data;
    this.total = count;
    this.limit = limit;
    this.page = page;
  }
}
