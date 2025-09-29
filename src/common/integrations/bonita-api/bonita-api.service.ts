import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ListBonitaProcessesDto } from './dto/list-processes.dto';

@Injectable()
export class BonitaApiService {
  apiUrl: string;
  username: string;
  password: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiUrl = this.configService.get<string>('BONITA_API_URL');
    this.username = this.configService.get<string>('BONITA_API_USERNAME');
    this.password = this.configService.get<string>('BONITA_API_PASSWORD');
  }

  loginBonita() {
    try {
      return firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/loginservice`,
          `username=${this.username}&password=${this.password}`,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      )
        .then((response) => {
          const cookie = response.headers['set-cookie'];
          return cookie;
        })
        .catch((error) => {
          console.error(
            'Error logging in to Bonita API:',
            error.response?.data || error.message,
          );
          throw new BadRequestException('Failed to login to Bonita API');
        });
    } catch (error) {
      console.error('Error logging in to Bonita API:', error);
      throw new BadRequestException(error.message || 'Unknown error occurred');
    }
  }

  async getProcessIdByName(name: string): Promise<string> {
    const processes = await this.listProcesses(0, 100);
    return this.getIdByProcessName(processes, name);
  }

  async listProcesses(page = 0, count = 10): Promise<ListBonitaProcessesDto[]> {
    const cookie = await this.loginBonita();
    try {
      return firstValueFrom(
        this.httpService.get<ListBonitaProcessesDto[]>(
          `${this.apiUrl}/API/bpm/process`,
          {
            headers: {
              Cookie: cookie,
            },
            params: {
              p: page,
              c: count,
            },
          },
        ),
      ).then((response) => {
        return response.data;
      });
    } catch (error) {
      console.error('Error listing processes from Bonita API:', error);
      throw new BadRequestException(error.message || 'Unknown error occurred');
    }
  }

  async initiateProcessById(processId: string): Promise<void> {
    const cookie = await this.loginBonita();
    const apiToken = cookie[1].split(';')[0].split('=')[1];
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/API/bpm/process/${processId}/instantiation`,
          {},
          {
            headers: {
              Cookie: cookie,
              'X-Bonita-API-Token': apiToken,
            },
          },
        ),
      ).then((response) => {
        return response.data;
      });
    } catch (error) {
      console.error('Error initiating process from Bonita API:', error);
      throw new BadRequestException(error.message || 'Unknown error occurred');
    }
  }

  private getIdByProcessName(
    processes: ListBonitaProcessesDto[],
    name: string,
  ): string {
    const process = processes.find((p) => p.name === name);
    return process ? process.id : '';
  }
}
