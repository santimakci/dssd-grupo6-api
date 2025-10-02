import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ong } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class OngsRepository {
  constructor(
    @InjectRepository(Ong)
    private readonly ongsRepository: Repository<Ong>,
  ) {}

  save(data: Partial<Ong>) {
    return this.ongsRepository.save(data);
  }

  findOneByEmail(email: string) {
    return this.ongsRepository.findOne({ where: { email } });
  }
}
