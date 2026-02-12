import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserEventService } from './user-event.service';
import { UpdateUserEventDto } from './dto/update-user-event.dto';
import { CreateUserEventWithRelationshipDto } from './dto/create-user-event-with-relationship.dto';
import { UpdateUserEventWithRelationshipDto } from './dto/update-user-event-with-relationship.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { FilterUserEvent } from './dto/filter-user-event.dto';
import { User } from '../user/entities/user.entity';
import { UserRole } from 'src/common/enums/user.enum';
import { SyncToCalendarDto } from './dto/sync-to-calendar.dto';

@Controller('user-event')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized - Invalid or missing JWT token',
})
@ApiForbiddenResponse({
  description: 'Forbidden - Insufficient permissions',
})
export class UserEventController {
  constructor(private readonly userEventService: UserEventService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user event with relations' })
  @ApiBody({ type: CreateUserEventWithRelationshipDto })
  @ApiResponse({
    status: 201,
    description: 'User event with relations created successfully',
  })
  async create(@Body() body: CreateUserEventWithRelationshipDto) {
    const { userEvent, relations } = body;
    console.log('Creating user event with data:', body);
    if (relations && Object.keys(relations).length > 0) {
      console.log('Creating with relations:', relations);
      return await this.userEventService.createWithRelations(
        userEvent,
        relations,
      );
    } else {
      console.log('Creating without relations');
      return await this.userEventService.create(userEvent);
    }
  }

  @Get()
  async findAll(@Query() filter: FilterUserEvent, @GetUser() user: User) {
    if (user.role !== UserRole.ADMIN) {
      // Non-admin users can only see their own events
      filter.userId = user.id;
    }
    return await this.userEventService.findAll(filter, [], []);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.userEventService.findOne(id, ['reminders', 'offerings']);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user event' })
  @ApiBody({ type: UpdateUserEventWithRelationshipDto })
  @ApiResponse({ status: 200, description: 'User event updated successfully' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateUserEventWithRelationshipDto,
  ) {
    const { userEvent, relations } = body;
    console.log('Updating user event with data:', body);
    if (relations && Object.keys(relations).length > 0) {
      console.log('Updating with relations:', relations);
      return this.userEventService.updateWithRelations(
        id,
        userEvent as UpdateUserEventDto,
        relations,
      );
    } else {
      console.log('Updating without relations');
      return this.userEventService.update(id, userEvent as UpdateUserEventDto);
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userEventService.softRemove(id);
  }

  @Post(':id/sync-to-calendar')
  @ApiOperation({ summary: 'Sync user event to Google Calendar' })
  @ApiBody({ type: SyncToCalendarDto })
  @ApiResponse({
    status: 200,
    description: 'Event synced to Google Calendar successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to sync - Invalid refresh token or event not found',
  })
  async syncToCalendar(
    @Param('id') id: string,
    @Body() syncDto: SyncToCalendarDto,
  ) {
    return await this.userEventService.syncToGoogleCalendar(
      id,
      syncDto.googleRefreshToken,
    );
  }
}