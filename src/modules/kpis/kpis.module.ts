import { Module } from '@nestjs/common';
import { KpisService } from './kpis.service';
import { KpisController } from './kpis.controller';
import { BonitaApiModule } from 'src/common/integrations/bonita-api/bonita.module';

@Module({
  controllers: [KpisController],
  providers: [KpisService],
  imports: [BonitaApiModule],
})
export class KpisModule {}
