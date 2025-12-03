import { Expose } from 'class-transformer';

export class CreateProjectObservationDto {
  @Expose()
  observations: string[];
}
