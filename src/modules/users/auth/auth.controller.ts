import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  loginAdmin(@Body() body: { email: string; password: string }) {
    return this.authService.loginAdmin(body.email, body.password);
  }
}
