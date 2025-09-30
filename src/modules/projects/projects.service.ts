import { BadRequestException, Injectable } from '@nestjs/common';
import { BonitaApiService } from 'src/common/integrations/bonita-api/bonita-api.service';
import { parseTsClassToJavaClass } from 'src/common/helpers/parsers/parse-tsclass-to-javaclass';

@Injectable()
export class ProjectsService {
  constructor(private readonly bonitaApiService: BonitaApiService) {}

  async createProject(body: any) {
    try {
      const cookie = await this.bonitaApiService.loginBonita();
      const processId = await this.bonitaApiService.getProcessIdByName(
        'Proceso de creación de proyecto',
        cookie,
      );
      if (!processId) {
        throw new BadRequestException('Bonita process not found');
      }

      const processInstanceId = await this.bonitaApiService.initiateProcessById(
        processId,
        cookie,
      );

      const setVariablePromises = Object.entries(body).map(([key, value]) => {
        const javaClassName = parseTsClassToJavaClass(typeof value);
        return this.bonitaApiService.setVariableByCaseId(
          processInstanceId,
          key,
          value,
          javaClassName,
          cookie,
        );
      });

      try {
        await Promise.all(setVariablePromises);
      } catch (error) {
        await this.bonitaApiService.deleteInstanceById(
          processInstanceId,
          cookie,
        );
        throw new BadRequestException(
          'Error setting process variables: ' + (error.message || error),
        );
      }
      return { message: 'Bonita process initiated', caseId: processInstanceId };
    } catch (error) {
      throw new BadRequestException(error.message || 'Unknown error occurred');
    }
  }
}
