import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BonitaApiService } from './bonita-api.service';

@Module({
  imports: [HttpModule],
  providers: [BonitaApiService],
  exports: [BonitaApiService],
})
export class BonitaApiModule {}
