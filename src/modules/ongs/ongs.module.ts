import { Module } from '@nestjs/common';
import { OngsService } from './ongs.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  providers: [OngsService],
  imports: [RepositoriesModule, OngsModule],
  exports: [OngsService],
})
export class OngsModule {}
