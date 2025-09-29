import { BadRequestException, Injectable } from '@nestjs/common';
import { BonitaApiService } from 'src/common/integrations/bonita-api/bonita-api.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly bonitaApiService: BonitaApiService) {}

  async createProject() {
    const processId = await this.bonitaApiService.getProcessIdByName(
      'Proceso de creación de proyecto',
    );
    if (!processId) {
      throw new BadRequestException('Bonita process not found');
    }
    await this.bonitaApiService.initiateProcessById(processId);
    return { message: 'Bonita process initiated' };
  }
}
