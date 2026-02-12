import { Injectable } from '@nestjs/common';
import { TtsAdapter } from './tts.adapter';

@Injectable()
export class TtsService {
  constructor(private readonly ttsAdapter: TtsAdapter) {}
  async getSynthesize(text: string, config: any): Promise<Buffer> {
    return this.ttsAdapter.synthesize(text, config);
  }
}
