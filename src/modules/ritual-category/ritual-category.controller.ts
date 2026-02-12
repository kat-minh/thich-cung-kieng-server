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
import { RitualCategoryService } from './ritual-category.service';
import { CreateRitualCategoryDto } from './dto/create-ritual-category.dto';
import { UpdateRitualCategoryDto } from './dto/update-ritual-category.dto';
import { FilterRitualCategoryDto } from './dto/filter-ritual-category.dto';

@Public()
@Controller('ritual-category')
export class RitualCategoryController {
  constructor(private readonly ritualCategoryService: RitualCategoryService) {}

  @Post()
  create(@Body() createRitualCategoryDto: CreateRitualCategoryDto) {
    return this.ritualCategoryService.create(createRitualCategoryDto);
  }

  @Get()
  findAll(@Query() filter: FilterRitualCategoryDto) {
    return this.ritualCategoryService.findAll(filter, [], []);
  }

  @Get('select')
  select() {
    return this.ritualCategoryService.selectOptions();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ritualCategoryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRitualCategoryDto: UpdateRitualCategoryDto,
  ) {
    return this.ritualCategoryService.update(id, updateRitualCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ritualCategoryService.delete(id);
  }
}
