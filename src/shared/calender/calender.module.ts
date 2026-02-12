import { Module } from '@nestjs/common';
import { CalenderService } from './calender.service';

@Module({
  providers: [CalenderService],
  exports: [CalenderService],
})
export class CalenderModule {}
