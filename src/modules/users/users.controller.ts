import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { SearchUserPaginatorDto } from './dto/search-paginator.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AdminGuard } from 'src/guards/admin.guard';
import { Serialize } from 'src/common/helpers/serializer.interceptor';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth('jwt')
@Controller('users')
@ApiTags('Users')
@UseGuards(AuthenticationGuard)
@UseGuards(AdminGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Crear un usuario' })
  @ApiBody({ type: CreateUserDto })
  @Post()
  @Serialize(UserDto)
  create(
    @Body(
      new ValidationPipe({
        transform: true,
      }),
    )
    createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Lista de usuarios paginada' })
  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  findAll(@Query() query: SearchUserPaginatorDto) {
    return this.usersService.findAll(query);
  }

  @ApiOperation({ summary: 'Lista de todos los usuarios sin paginación' })
  @Get('all')
  @Serialize(UserDto)
  findAllNoPagination() {
    return this.usersService.findAllNoPagination();
  }

  @Get(':id')
  @Serialize(UserDto)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
  /* 
  @Post(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Post(':id/activate')
  activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  } */

  @ApiOperation({ summary: 'Cambiar la contraseña de un usuario' })
  @ApiBody({ type: UpdatePasswordDto })
  @Post(':id/password')
  changePassword(
    @Param('id') id: string,
    @Body(
      new ValidationPipe({
        transform: true,
      }),
    )
    body: UpdatePasswordDto,
  ) {
    return this.usersService.changePassword(
      id,
      body.password,
      body.repeatPassword,
    );
  }
}
