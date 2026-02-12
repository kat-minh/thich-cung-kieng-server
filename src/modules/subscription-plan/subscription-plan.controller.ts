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
import { SubscriptionPlanService } from './subscription-plan.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { FilterSubscriptionPlanDto } from './dto/filter-subscription-plan.dto';
import { CreateSubscriptionPlanWithRelationDto } from './dto/create-subscription-plan-with-relation.dto';
import { UpdateSubscriptionPlanWithRelationDto } from './dto/update-subscription-plan-with-relation.dto';

@Public()
@Controller('subscription-plan')
export class SubscriptionPlanController {
  constructor(
    private readonly subscriptionPlanService: SubscriptionPlanService,
  ) {}

  @Post()
  async create(@Body() body: CreateSubscriptionPlanWithRelationDto) {
    console.log(body);
    const { subscriptionPlan, relations } = body;
    if (relations && Object.keys(relations).length > 0) {
      return await this.subscriptionPlanService.createWithRelations(
        subscriptionPlan,
        relations,
      );
    } else {
      return await this.subscriptionPlanService.create(subscriptionPlan);
    }
  }

  @Get()
  findAll(@Query() filter: FilterSubscriptionPlanDto) {
    return this.subscriptionPlanService.findAll(
      filter,
      ['planFeatures', 'planFeatures.subscriptionFeature'],
      [],
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionPlanService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateSubscriptionPlanWithRelationDto,
  ) {
    const { subscriptionPlan, relations } = body;
    if (relations && Object.keys(relations).length > 0) {
      return await this.subscriptionPlanService.updateWithRelations(
        id,
        subscriptionPlan as UpdateSubscriptionPlanDto,
        relations,
      );
    } else {
      return await this.subscriptionPlanService.update(
        id,
        subscriptionPlan as UpdateSubscriptionPlanDto,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.subscriptionPlanService.remove(id);
  }
}
