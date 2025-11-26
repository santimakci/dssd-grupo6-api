import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ListBonitaProcessesDto } from './dto/list-processes.dto';
import { throwHttpByStatus } from 'src/common/helpers/http-error-mapper';
import { ListTasksCloudDto } from './dto/list-tasks.dto';
import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { ListBonitaTaskDto } from './dto/list-bonita-tasks.dto';
import { ListUserDto } from './dto/list-users.dto';

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

  async loginBonita() {
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
          throwHttpByStatus(error, 'Failed to login to Bonita API');
        });
    } catch (error) {
      console.error('Error logging in to Bonita API:', error);
      throwHttpByStatus(error, 'Unknown error occurred');
    }
  }

  async getProcessIdByName(name: string, cookie: string[]): Promise<string> {
    const processes = await this.listProcesses(cookie, 0, 100);
    return this.getIdByProcessName(processes, name);
  }

  async listProcesses(
    cookie: string[],
    page = 0,
    count = 10,
  ): Promise<ListBonitaProcessesDto[]> {
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
      throwHttpByStatus(error, 'Unknown error occurred');
    }
  }

  async initiateProcessById(
    processId: string,
    cookie: string[],
  ): Promise<number> {
    const apiToken = this.parseApiToken(cookie);
    try {
      return await firstValueFrom(
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
      )
        .then((response) => {
          return response.data.caseId;
        })
        .catch((error) => {
          console.error(
            'Error initiating process from Bonita API:',
            error.response?.data || error.message,
          );
          throwHttpByStatus(error, 'Failed to initiate process in Bonita API');
        });
    } catch (error) {
      console.error('Error initiating process from Bonita API:', error);
      throwHttpByStatus(error, 'Unknown error occurred');
    }
  }

  async setVariableByCaseId(
    caseId: number,
    variableName: string,
    value: any,
    type: string,
    cookie: string[],
  ): Promise<void> {
    const apiToken = this.parseApiToken(cookie);
    try {
      await firstValueFrom(
        this.httpService.put(
          `${this.apiUrl}/API/bpm/caseVariable/${caseId}/${variableName}`,
          {
            value,
            type,
          },
          {
            headers: {
              Cookie: cookie,
              'X-Bonita-API-Token': apiToken,
            },
          },
        ),
      );
    } catch (error) {
      console.error('Error setting variable in Bonita API:', error);
      throwHttpByStatus(error, 'Unknown error occurred');
    }
  }

  async deleteInstanceById(
    instanceId: number,
    cookie: string[],
  ): Promise<void> {
    const apiToken = this.parseApiToken(cookie);
    try {
      await firstValueFrom(
        this.httpService.delete(`${this.apiUrl}/API/bpm/case/${instanceId}`, {
          headers: {
            Cookie: cookie,
            'X-Bonita-API-Token': apiToken,
          },
        }),
      );
    } catch (error) {
      throwHttpByStatus(error, 'Unknown error occurred');
    }
  }

  private getIdByProcessName(
    processes: ListBonitaProcessesDto[],
    name: string,
  ): string {
    const process = processes.find((p) => p.name === name);
    return process ? process.id : '';
  }

  private parseApiToken(cookie: string[]): string {
    const tokenCookie = cookie.find((c) => c.startsWith('X-Bonita-API-Token='));
    if (!tokenCookie) {
      throw new InternalServerErrorException('Bonita API token not found');
    }
    return tokenCookie.split(';')[0].split('=')[1];
  }

  /* TASKS */

  async listTasks(
    cookie: string[],
    page: number,
    count: number,
    caseId: number,
  ): Promise<ListBonitaTaskDto[]> {
    try {
      return firstValueFrom(
        this.httpService.get<ListBonitaTaskDto[]>(
          `${this.apiUrl}/API/bpm/task`,
          {
            headers: {
              Cookie: cookie,
            },
            params: {
              p: page,
              c: count,
              f: `caseId=${caseId}`,
            },
          },
        ),
      ).then((response) => {
        return response.data;
      });
    } catch (error) {
      console.error('Error listing tasks from Bonita API:', error);
      throwHttpByStatus(error, 'Unknown error occurred');
    }
  }

  async assignTaskToUser(
    taskId: string,
    assignedId: string,
    cookie: string[],
  ): Promise<void> {
    const apiToken = this.parseApiToken(cookie);
    try {
      await firstValueFrom(
        this.httpService.put(
          `${this.apiUrl}/API/bpm/humanTask/${taskId}`,
          {
            assigned_id: assignedId,
          },
          {
            headers: {
              Cookie: cookie,
              'X-Bonita-API-Token': apiToken,
            },
          },
        ),
      );
    } catch (error) {
      console.error('Error taking task in Bonita API:', error);
      throwHttpByStatus(error, 'Unknown error occurred');
    }
  }

  async listUsersBonita(
    cookie: string[],
    page: number,
    count: number,
    userName: string,
  ): Promise<ListUserDto[]> {
    try {
      return firstValueFrom(
        this.httpService.get<ListUserDto[]>(
          `${this.apiUrl}/API/identity/user`,
          {
            headers: {
              Cookie: cookie,
            },
            params: {
              p: page,
              c: count,
              f: `userName=${userName}`,
            },
          },
        ),
      ).then((response) => {
        return response.data;
      });
    } catch (error) {
      console.error('Error listing users from Bonita API:', error);
      throwHttpByStatus(error, 'Unknown error occurred');
    }
  }

  async executeTask(
    taskId: string,
    body: any,
    cookie: string[],
  ): Promise<void> {
    const apiToken = this.parseApiToken(cookie);
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/API/bpm/userTask/${taskId}/execution?assign=true`,
          body,
          {
            headers: {
              Cookie: cookie,
              'X-Bonita-API-Token': apiToken,
            },
          },
        ),
      );
    } catch (error) {
      console.error('Error executing task in Bonita API:', error);
      throwHttpByStatus(error, 'Unknown error occurred');
    }
  }

  /* CUSTOM ENDPOINTS  */

  async listTasksFromCloud(
    cookie: string[],
    page: number,
    limit: number,
    loginDto: LoginDto,
    projectId: string,
  ): Promise<ListTasksCloudDto[]> {
    const apiToken = this.parseApiToken(cookie);
    console.log(
      `${this.apiUrl}/API/extension/projects?page=${page}&limit=${limit}&projectId=${projectId}`,
    );
    try {
      return firstValueFrom(
        this.httpService.post<ListTasksCloudDto[]>(
          `${this.apiUrl}/API/extension/projects?page=${page}&limit=${limit}&projectId=${projectId}`,
          loginDto,
          {
            headers: {
              'X-Bonita-API-Token': apiToken,
              Cookie: cookie,
            },
          },
        ),
      ).then((response) => {
        return response.data;
      });
    } catch (error) {
      console.error('Error listing tasks from Bonita API:', error);
      throwHttpByStatus(error, 'Unknown error occurred');
    }
  }

  async takeTaskFromCloud(
    taskId: string,
    name: string,
    email: string,
    emailCloud: string,
    password: string,
    cookie: string[],
  ): Promise<void> {
    const apiToken = this.parseApiToken(cookie);
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/API/extension/assignTask`,
          {
            taskId,
            name,
            email,
            emailCloud,
            password,
          },
          {
            headers: {
              'X-Bonita-API-Token': apiToken,
              Cookie: cookie,
            },
          },
        ),
      );
    } catch (error) {
      console.error('Error taking task from Bonita Cloud API:', error);
      throwHttpByStatus(error, 'Unknown error occurred');
    }
  }

  async finishTaskFromCloud(
    taskId: string,
    emailCloud: string,
    password: string,
    cookie: string[],
  ): Promise<void> {
    const apiToken = this.parseApiToken(cookie);
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/API/extension/finishTask`,
          {
            taskId,
            emailCloud,
            password,
          },
          {
            headers: {
              'X-Bonita-API-Token': apiToken,
              Cookie: cookie,
            },
          },
        ),
      );
    } catch (error) {
      console.error('Error finishing task from Bonita Cloud API:', error);
      throwHttpByStatus(error, 'Unknown error occurred');
    }
  }

  async countPendingTasksByProjectId(
    projectId: string,
    emailCloud: string,
    password: string,
    cookie: string[],
  ): Promise<{ total: number }> {
    const apiToken = this.parseApiToken(cookie);
    try {
      return firstValueFrom(
        this.httpService.post<{ total: number }>(
          `${this.apiUrl}/API/extension/countTasks`,
          {
            projectId,
            emailCloud,
            password,
          },
          {
            headers: {
              'X-Bonita-API-Token': apiToken,
              Cookie: cookie,
            },
          },
        ),
      ).then((response) => {
        return response.data;
      });
    } catch (error) {
      console.error(
        'Error counting pending tasks from Bonita Cloud API:',
        error,
      );
      throwHttpByStatus(error, 'Unknown error occurred');
    }
  }
}
