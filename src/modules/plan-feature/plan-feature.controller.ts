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
import { PlanFeatureService } from './plan-feature.service';
import { CreatePlanFeatureDto } from './dto/create-plan-feature.dto';
import { UpdatePlanFeatureDto } from './dto/update-plan-feature.dto';
import { BaseFilterDto } from 'src/common/base/dto/base-filter.dto';
import { FilterPlanFeatureDto } from './dto/filter-plan-feature.dto';

@Public()
@Controller('plan-feature')
export class PlanFeatureController {
  constructor(private readonly planFeatureService: PlanFeatureService) {}

  @Post()
  create(@Body() createPlanFeatureDto: CreatePlanFeatureDto) {
    return this.planFeatureService.create(createPlanFeatureDto);
  }

  @Get()
  findAll(@Query() filter: FilterPlanFeatureDto) {
    return this.planFeatureService.findAll(filter, [], []);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planFeatureService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlanFeatureDto: UpdatePlanFeatureDto,
  ) {
    return this.planFeatureService.update(id, updatePlanFeatureDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planFeatureService.remove(id);
  }
}
