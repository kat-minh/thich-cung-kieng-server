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
import { Public } from 'src/common/decorators/public.decorator';
import { OfferingMediaService } from './offering-media.service';
import { CreateOfferingMediaDto } from './dto/create-offering-media.dto';
import { UpdateOfferingMediaDto } from './dto/update-offering-media.dto';
import { FilterOfferingMediaDto } from './dto/filter-offering-media.dto';

@Public()
@Controller('offering-media')
export class OfferingMediaController {
  constructor(private readonly offeringMediaService: OfferingMediaService) {}

  @Post()
  create(@Body() createOfferingMediaDto: CreateOfferingMediaDto) {
    return this.offeringMediaService.create(createOfferingMediaDto);
  }

  @Get()
  findAll(@Query() filter: FilterOfferingMediaDto) {
    return this.offeringMediaService.findAll(filter, [], []);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offeringMediaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOfferingMediaDto: UpdateOfferingMediaDto,
  ) {
    return this.offeringMediaService.update(id, updateOfferingMediaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.offeringMediaService.remove(id);
  }
}
