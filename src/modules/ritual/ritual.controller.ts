import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { RitualService } from './ritual.service';
import { CreateRitualDto } from './dto/create-ritual.dto';
import { UpdateRitualDto } from './dto/update-ritual.dto';
import { FilterRitualDto } from './dto/filter-ritual.dto';
import { CreateRitualWithRelationsDto } from './dto/create-ritual-with-relations.dto';
import { UpdateRitualWithRelationsDto } from './dto/update-ritual-with-relations.dto';

@Public()
@ApiTags('Rituals')
@Controller('ritual')
export class RitualController {
  constructor(private readonly ritualService: RitualService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ritual with relations' })
  @ApiBody({ type: CreateRitualWithRelationsDto })
  @ApiResponse({
    status: 201,
    description: 'Ritual with relations created successfully',
  })
  async createWithRelations(@Body() body: any) {
    // Support both formats:
    // 1. Nested: { ritual: {...}, relations: {...} } (from Swagger/complex forms)
    // 2. Flat: { name, dateLunar, ... } (from simple FE forms)
    const isNestedFormat = body.ritual !== undefined;

    const ritualData = isNestedFormat ? body.ritual : body;
    const relations = isNestedFormat ? body.relations : undefined;

    if (relations && Object.keys(relations).length > 0) {
      return await this.ritualService.createWithRelations(
        ritualData,
        relations,
      );
    } else {
      return await this.ritualService.create(ritualData);
    }
  }

  @Get()
  findAll(@Query() filter: FilterRitualDto) {
    // Load minimal relations for list view
    return this.ritualService.findAll(
      filter,
      [
        'ritualMedias', // For display image
        'ritualTags',
        'ritualTags.tag',
      ],
      [],
    );
  }

  @Get('select')
  select() {
    return this.ritualService.selectOptions();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // Load essential relations for detail view
    return this.ritualService.findOne(id, [
      'ritualMedias',
      'ritualTags',
      'ritualTags.tag',
      'ritualOfferings',
      'prayers',
      'ritualReviews',
    ]);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a ritual' })
  @ApiBody({ type: UpdateRitualWithRelationsDto })
  @ApiResponse({ status: 200, description: 'Ritual updated successfully' })
  async update(@Param('id') id: string, @Body() body: any) {
    // Support both formats:
    // 1. Nested: { ritual: {...}, relations: {...} } (from Swagger/complex forms)
    // 2. Flat: { name, dateLunar, ... } (from simple FE forms)
    const isNestedFormat = body.ritual !== undefined;

    const ritualData = isNestedFormat ? body.ritual : body;
    const relations = isNestedFormat ? body.relations : undefined;

    if (relations && Object.keys(relations).length > 0) {
      return await this.ritualService.updateWithRelations(
        id,
        ritualData,
        relations,
      );
    } else {
      return await this.ritualService.update(id, ritualData);
    }
  }

  @Patch(':id/soft-remove')
  @ApiOperation({ summary: 'Soft Remove a ritual' })
  @ApiResponse({ status: 200, description: 'Ritual soft removed successfully' })
  softRemove(@Param('id') id: string) {
    return this.ritualService.softRemove(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ritualService.remove(id);
  }
}
