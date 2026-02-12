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
import { UserEventReminderService } from './user_event_reminder.service';
import { CreateUserEventReminderDto } from './dto/create-user_event_reminder.dto';
import { UpdateUserEventReminderDto } from './dto/update-user_event_reminder.dto';
import { BaseFilterDto } from 'src/common/base/dto/base-filter.dto';

@Public()
@Controller('user-event-reminder')
export class UserEventReminderController {
  constructor(
    private readonly userEventReminderService: UserEventReminderService,
  ) {}

  @Post()
  create(@Body() createUserEventReminderDto: CreateUserEventReminderDto) {
    return this.userEventReminderService.create(createUserEventReminderDto);
  }

  @Get()
  findAll(@Query() filter: BaseFilterDto) {
    return this.userEventReminderService.findAll(filter, [], []);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userEventReminderService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserEventReminderDto: UpdateUserEventReminderDto,
  ) {
    return this.userEventReminderService.update(id, updateUserEventReminderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userEventReminderService.remove(id);
  }
}
