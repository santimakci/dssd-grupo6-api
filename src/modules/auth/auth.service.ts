import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { UserRole } from 'src/common/enums/user-role.enum';
import { ConfigService } from '@nestjs/config';
import { BonitaApiService } from 'src/common/integrations/bonita-api/bonita-api.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async loginAdmin(email: string, password: string) {
    const user = await this.findUserByEmailWithPassword(email);
    if (!user) throw new BadRequestException('User not found');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new BadRequestException('Invalid password or user');
    const token = this.getAdminToken(user);
    const result = this.sendToken(user, token);
    return result;
  }

  private async findUserByEmailWithPassword(email: string) {
    return this.userRepository.findOne({
      select: ['id', 'email', 'firstName', 'lastName', 'password', 'roles'],
      where: {
        email,
      },
    });
  }

  getAdminToken(user: User) {
    const payload = {
      email: user.email,
      id: user.id,
    };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });
  }

  private sendToken(user: User, accessToken: string) {
    return {
      token: accessToken,
      user: {
        email: user.email,
        firstName: user.firstName,
        id: user.id,
        lastName: user.lastName,
        roles: user.roles,
      } as any,
    };
  }
}
