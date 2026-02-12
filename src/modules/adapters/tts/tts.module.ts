import { Module } from '@nestjs/common';
import { TtsAdapter } from './tts.adapter';
import { TtsService } from './tts.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [TtsAdapter, TtsService],
  exports: [TtsService, TtsAdapter],
})
export class TtsModule { }
