import { Expose } from 'class-transformer';

export class PaginatorDto {
  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  total: number;
}
