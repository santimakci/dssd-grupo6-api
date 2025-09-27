import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

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
        });
    } catch (error) {
      console.error('Error logging in to Bonita API:', error);
      throw error;
    }
  }
}
