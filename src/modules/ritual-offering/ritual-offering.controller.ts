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
import { RitualOfferingService } from './ritual-offering.service';
import { FilterRitualOfferingDto } from './dto/filter-ritual-offering.dto';
import { CreateRitualOfferingWithRelationsDto } from './dto/create-ritual-offering-with-relations.dto';
import { UpdateRitualOfferingWithRelationsDto } from './dto/update-ritual-offering-with-relations.dto';

@Public()
@ApiTags('RitualOfferings')
@Controller('RitualOfferings')
export class RitualOfferingController {
  constructor(private readonly offeringService: RitualOfferingService) {}
  @Post('with-relations')
  @ApiOperation({ summary: 'Create a new offering' })
  @ApiBody({ type: CreateRitualOfferingWithRelationsDto })
  @ApiResponse({ status: 201, description: 'Offering created successfully' })
  async createWithRelations(
    @Body() body: CreateRitualOfferingWithRelationsDto,
  ) {
    const { ritualOffering, relations } = body;

    if (relations && Object.keys(relations).length > 0) {
      return this.offeringService.createWithRelations(
        ritualOffering,
        relations,
      );
    } else {
      return this.offeringService.create(ritualOffering);
    }
  }

  @Get()
  findAll(@Query() filter: FilterRitualOfferingDto) {
    return this.offeringService.findAll(filter, ['offeringMedias'], []);
  }

  @Get('select')
  select() {
    return this.offeringService.selectOptions();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offeringService.findOne(id, ['offeringMedias']);
  }

  @Put(':id/with-relations')
  @ApiOperation({ summary: 'Update an offering with relations' })
  @ApiBody({ type: UpdateRitualOfferingWithRelationsDto })
  @ApiResponse({
    status: 200,
    description: 'Offering updated successfully with relations',
  })
  async updateWithRelations(
    @Param('id') id: string,
    @Body() body: UpdateRitualOfferingWithRelationsDto,
  ) {
    const { ritualOffering, relations } = body;

    if (relations && Object.keys(relations).length > 0) {
      return this.offeringService.updateWithRelations(
        id,
        ritualOffering,
        relations,
      );
    } else {
      return this.offeringService.update(id, ritualOffering);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an offering' })
  @ApiResponse({ status: 200, description: 'Offering deleted successfully' })
  remove(@Param('id') id: string) {
    return this.offeringService.remove(id);
  }
}
