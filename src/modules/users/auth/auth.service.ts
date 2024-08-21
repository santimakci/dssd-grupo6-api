import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { UserRole } from 'src/common/enums/user-role.enum';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.findUserByEmailWithPassword(email);
    // const isMatch = await bcrypt.compare(password, user.password);
    const isMatch = await argon2.verify(user.password, password);

    if (!isMatch) {
      throw new BadRequestException('Invalid password or user');
    }
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (!user.roles.includes(UserRole.USER)) {
      throw new BadRequestException('User is not app user');
    }

    const token = this.getAppToken(user);
    const result = this.sendToken(user, token);
    return result;
  }

  async loginAdmin(email: string, password: string) {
    const user = await this.findUserByEmailWithPassword(email);
    if (!user) throw new BadRequestException('User not found');
    // const isMatch = await bcrypt.compare(password, user.password);
    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) throw new BadRequestException('Invalid password or user');
    if (!user.roles.includes(UserRole.ADMIN)) {
      throw new BadRequestException('User is not admin');
    }
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

  getAppToken(user: User) {
    const payload = {
      email: user.email,
      id: user.id,
    };
    return this.jwtService.sign(payload, {
      secret: process.env.APP_JWT_SECRET,
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
