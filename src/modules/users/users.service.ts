import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from 'src/repositories';
import { CreateUserDto } from './dto/create-user.dto';
import { SearchUserPaginatorDto } from './dto/search-paginator.dto';
import { ListPaginatorDto } from './dto/list-paginator.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    const existUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existUser) throw new BadRequestException('El usuario ya existe');
    let hash: string;
    try {
      hash = await this.generatePassword(createUserDto.password);
    } catch (error) {
      console.error('Error generating password hash', error);
      throw new BadRequestException('Error al generar la contraseña');
    }
    const user = await this.userRepository.create({
      ...createUserDto,
      password: hash,
    });

    return user;
  }

  async findAllNoPagination() {
    return this.userRepository.findAllNoPagination();
  }

  async findAll(query: SearchUserPaginatorDto) {
    const { limit = 10, page = 0, search = '' } = query;
    const [data, count] = await this.userRepository.findAndCount(
      page,
      limit,
      search,
    );
    return new ListPaginatorDto(data, count, limit, page);
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOneById(id);
    if (!user) throw new BadRequestException('User not found');
    return user;
  }

  /*   async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    return this.userRepository.update(id, { ...user, ...updateUserDto });
  } */

  async deactivate(id: string) {
    const user = await this.findOne(id);
    user.isActive = false;
    return this.userRepository.save(user);
  }

  async activate(id: string) {
    const user = await this.findOne(id);
    user.isActive = true;
    return this.userRepository.save(user);
  }

  async changePassword(id: string, password: string, repetedPassword: string) {
    if (password !== repetedPassword)
      throw new BadRequestException('Las contraseñas no coinciden');
    const hash = await this.generatePassword(password);
    return this.userRepository.update(id, { password: hash });
  }
  private async generatePassword(password: string) {
    try {
      const numberOfSaltRounds = 5;
      const hash = await bcrypt.hash(password, numberOfSaltRounds);
      return hash;
    } catch (error) {
      console.error('Error generating password hash', error);
      throw new BadRequestException('Error al generar la contraseña');
    }
  }
}
