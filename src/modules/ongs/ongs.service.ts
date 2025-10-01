import { Injectable } from '@nestjs/common';
import { CreateOngDto } from './dto/create-ong.dto';
import { OngsRepository } from 'src/repositories/ongs.repository';

@Injectable()
export class OngsService {
  constructor(private readonly ongsRepository: OngsRepository) {}

  async findOrCreate(createOngDto: CreateOngDto) {
    let ong = await this.ongsRepository.findOneByEmail(createOngDto.email);
    if (!ong) {
      ong = await this.ongsRepository.save(createOngDto);
    }
    return ong;
  }
}
