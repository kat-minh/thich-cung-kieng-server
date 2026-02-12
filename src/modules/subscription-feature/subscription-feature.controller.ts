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
import { Public } from 'src/common/decorators/public.decorator';
import { SubscriptionFeatureService } from './subscription-feature.service';
import { CreateSubscriptionFeatureDto } from './dto/create-subscription-feature.dto';
import { UpdateSubscriptionFeatureDto } from './dto/update-subscription-feature.dto';
import { BaseFilterDto } from 'src/common/base/dto/base-filter.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Public()
@Controller('subscription-feature')
export class SubscriptionFeatureController {
  constructor(
    private readonly subscriptionFeatureService: SubscriptionFeatureService,
  ) {}

  @Post()
  @ApiBody({ type: CreateSubscriptionFeatureDto })
  async create(
    @Body() createSubscriptionFeatureDto: CreateSubscriptionFeatureDto,
  ) {
    return await this.subscriptionFeatureService.create(
      createSubscriptionFeatureDto,
    );
  }

  @Get()
  async findAll(@Query() filter: BaseFilterDto) {
    return await this.subscriptionFeatureService.findAll(filter, [], []);
  }

  @Get('select')
  async select() {
    return await this.subscriptionFeatureService.selectOptions();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.subscriptionFeatureService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a subscription feature' })
  @ApiBody({ type: UpdateSubscriptionFeatureDto })
  @ApiResponse({ status: 200, description: 'Subscription feature updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateSubscriptionFeatureDto: UpdateSubscriptionFeatureDto,
  ) {
    return await this.subscriptionFeatureService.update(
      id,
      updateSubscriptionFeatureDto,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.subscriptionFeatureService.remove(id);
  }
}
