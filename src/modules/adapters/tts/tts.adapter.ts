import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TtsAdapter {
  private readonly logger = new Logger(TtsAdapter.name);

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async synthesize(text: string, ttsConfig: string): Promise<Buffer> {
    if (!text) {
      throw new Error('Text is required');
    }
    if (!ttsConfig) {
      throw new Error('TTS configuration is required');
    }

    try {
      const apiUrl = this.configService.get<string>(`${ttsConfig}.apiUrl`);

      if (!apiUrl) {
        throw new Error('TTS API URL not configured');
      }

      // Create form-urlencoded data
      const formData = new URLSearchParams();
      formData.append('text', text);

      const res = await firstValueFrom(
        this.http.post(apiUrl, formData.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'audio/mpeg',
          },
          responseType: 'arraybuffer', // Để nhận binary data
        }),
      );

      return Buffer.from(res.data);
    } catch (error) {
      if (error.response?.status === 422) {
        this.logger.error(`TTS 422 Validation Error:`, {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else {
        this.logger.error(`TTS error:`, {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
      }
      throw new Error(`TTS API error: ${error.message}`);
    }
  }
}
