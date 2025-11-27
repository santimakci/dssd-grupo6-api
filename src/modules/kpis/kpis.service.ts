import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BonitaApiService } from 'src/common/integrations/bonita-api/bonita-api.service';

@Injectable()
export class KpisService {
  constructor(
    private readonly configService: ConfigService,
    private readonly bonitaApiService: BonitaApiService,
  ) {}

  async totalCases() {
    const cookie = await this.bonitaApiService.loginBonita();

    const archivedCases = await this.bonitaApiService.listArchivedCases(
      cookie,
      0,
      1000000,
    );
    const openCases = await this.bonitaApiService.listOpenCases(
      cookie,
      0,
      1000000,
    );

    const tasksKpis = await this.bonitaApiService.getTasksKpis(
      cookie,
      this.configService.get<string>('ADMIN_CLOUD_EMAIL'),
      this.configService.get<string>('ADMIN_CLOUD_PASSWORD'),
    );

    return {
      finishedCases: archivedCases.length,
      ongoingCases: openCases.length,
      totalCases: archivedCases.length + openCases.length,
      ...tasksKpis,
    };
  }
}
