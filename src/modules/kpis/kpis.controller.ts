import { Controller, Get, UseGuards } from '@nestjs/common';
import { KpisService } from './kpis.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/guards/authentication.guard';

@ApiBearerAuth('jwt')
@ApiTags('kpis')
@Controller('kpis')
@UseGuards(AuthenticationGuard)
export class KpisController {
  constructor(private readonly kpisService: KpisService) {}

  @Get('/cases')
  totalCases() {
    return this.kpisService.totalCases();
  }
}
