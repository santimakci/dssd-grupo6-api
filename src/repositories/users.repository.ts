import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities';
import { Like, Repository } from 'typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  create(data: Partial<User>) {
    return this.usersRepository.save(data);
  }

  update(id: string, data: Partial<User>) {
    return this.usersRepository.update(id, data);
  }

  save(data: Partial<User>) {
    return this.usersRepository.save(data);
  }

  findAllNoPagination() {
    return this.usersRepository.find({
      where: {
        isActive: true,
      },
      order: {
        lastName: 'ASC',
        firstName: 'ASC',
      },
    });
  }

  findAndCount(page: number, limit: number, search: string) {
    return this.usersRepository.findAndCount({
      order: {
        email: 'ASC',
      },
      skip: page * limit,
      take: limit,
      where: [
        { email: Like(`%${search}%`) },
        { firstName: Like(`%${search}%`) },
        { lastName: Like(`%${search}%`) },
      ],
    });
  }

  findOneById(id: string) {
    return this.usersRepository.findOneBy({ id });
  }

  delete(id: string) {
    return this.usersRepository.delete(id);
  }
}
