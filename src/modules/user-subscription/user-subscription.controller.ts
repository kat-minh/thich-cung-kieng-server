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
import { UserSubscriptionService } from './user-subscription.service';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';
import { UpdateUserSubscriptionDto } from './dto/update-user-subscription.dto';
import { BaseFilterDto } from 'src/common/base/dto/base-filter.dto';
import { FilterUserSubsciptionDto } from './dto/filter-user-subscription.dto';

@Public()
@Controller('user-subscription')
export class UserSubscriptionController {
  constructor(
    private readonly userSubscriptionService: UserSubscriptionService,
  ) {}

  @Post()
  create(@Body() createUserSubscriptionDto: CreateUserSubscriptionDto) {
    return this.userSubscriptionService.create(createUserSubscriptionDto);
  }

  @Get()
  findAll(@Query() filter: FilterUserSubsciptionDto) {
    return this.userSubscriptionService.findAll(filter, [], []);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userSubscriptionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserSubscriptionDto: UpdateUserSubscriptionDto,
  ) {
    return this.userSubscriptionService.update(id, updateUserSubscriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userSubscriptionService.delete(id);
  }
}
