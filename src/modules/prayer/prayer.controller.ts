import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PrayerService } from './prayer.service';
import { CreatePrayerDto } from './dto/create-prayer.dto';
import { UpdatePrayerDto } from './dto/update-prayer.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { FilterPrayerDto } from './dto/filter-prayer.dto';

@Public()
@Controller('prayer')
export class PrayerController {
  constructor(private readonly prayerService: PrayerService) {}

  @Post()
  create(@Body() createPrayerDto: CreatePrayerDto) {
    return this.prayerService.create(createPrayerDto);
  }

  @Public()
  @Get()
  findAll(@Query() filter: FilterPrayerDto) {
    return this.prayerService.findAll(filter, [], []);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prayerService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePrayerDto: UpdatePrayerDto) {
    return this.prayerService.update(id, updatePrayerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prayerService.delete(id);
  }
}
