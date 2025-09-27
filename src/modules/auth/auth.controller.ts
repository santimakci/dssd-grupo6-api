import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  loginAdmin(
    @Body(
      new ValidationPipe({
        transform: true,
      }),
    )
    body: LoginDto,
  ) {
    return this.authService.loginAdmin(body.email, body.password);
  }

  @Post('bonita/login')
  loginBonita(@Body() body: { email: string; password: string }) {
    return this.authService.loginBonita(body.email, body.password);
  }
}
