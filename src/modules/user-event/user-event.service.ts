import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base/service/service.base';
import { UserEvent } from './entities/user-event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  EntityManager,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { RedisService } from 'src/shared/redis/redis.service';
import { FilterUserEvent } from './dto/filter-user-event.dto';
import { CreateUserEventDto } from './dto/create-user-event.dto';
import { UserEventReminderService } from '../user_event_reminder/user_event_reminder.service';
import { UserEventOfferingService } from '../user_event_offering/user_event_offering.service';
import { UpdateUserEventDto } from './dto/update-user-event.dto';
import { UserService } from '../user/user.service';
import { RitualService } from '../ritual/ritual.service';
import { GoogleCalendarService } from '../auth/google/services/google-calendar.service';

@Injectable()
export class UserEventService extends BaseService<UserEvent> {
  constructor(
    @InjectRepository(UserEvent, 'postgresql')
    private readonly userEventRepository: Repository<UserEvent>,
    private readonly redisService: RedisService,
    private readonly userEventReminderService: UserEventReminderService,
    private readonly userEventOfferingService: UserEventOfferingService,
    private readonly userService: UserService,
    private readonly ritualService: RitualService,
    private readonly googleCalendarService: GoogleCalendarService,
  ) {
    super(userEventRepository, redisService);
  }

  protected getDuplicateFields(): string[] {
    return [];
  }

  protected getDefaultRelations(): string[] {
    return ['user', 'reminders', 'offerings'];
  }

  protected getSearchableFields(): string[] {
    return ['title', 'description', 'location'];
  }

  protected createQueryBuilder(
    filter: FilterUserEvent,
  ): SelectQueryBuilder<UserEvent> {
    const aliasName = UserEvent.name.toLowerCase();
    const queryBuilder = this.userEventRepository.createQueryBuilder(
      `${aliasName}`,
    );

    // Apply soft delete filter by default
    queryBuilder.andWhere(`${aliasName}.deletedAt IS NULL`);

    // Apply filters if provided
    if (filter.userId) {
      queryBuilder.andWhere(`${aliasName}.userId = :userId`, {
        userId: filter.userId,
      });
    }

    if (filter.status) {
      queryBuilder.andWhere(`${aliasName}.status = :status`, {
        status: filter.status,
      });
    }

    if (filter.eventDate) {
      queryBuilder.andWhere(`${aliasName}.eventDate = :eventDate`, {
        eventDate: filter.eventDate,
      });
    }

    return queryBuilder;
  }

  protected async validateCreateInput(
    createDto: CreateUserEventDto,
  ): Promise<void> {
    if (!createDto) {
      throw new BadRequestException(
        'CreateUserEventDto cannot be null or undefined',
      );
    }
  }

  protected async validateUpdateInput(
    updateDto: UpdateUserEventDto,
  ): Promise<void> {
    if (!updateDto) {
      throw new BadRequestException(
        'UpdateUserEventDto cannot be null or undefined',
      );
    }
    console.log(updateDto);
    if (updateDto.userId) {
      const isUserExist = await this.userService.findOne(updateDto.userId);
      if (!isUserExist) {
        throw new BadRequestException('User does not exist');
      }
    }
    if (updateDto.ritualId) {
      const isRitualExist = await this.ritualService.findOne(
        updateDto.ritualId,
      );
      if (!isRitualExist) {
        throw new BadRequestException('Ritual does not exist');
      }
    }
  }

  protected async createRelationships(
    manager: EntityManager,
    mainEntity: UserEvent,
    relationData?: Record<string, any>,
  ): Promise<void> {
    this.logger.log(`Creating relationships for UserEvent: ${mainEntity.id}`);
    this.logger.log(`Relation data:`, relationData);

    const promises: Promise<any>[] = [];

    // Create event reminders
    if (relationData?.eventReminders?.length) {
      this.logger.log(
        `Creating ${relationData.eventReminders.length} event reminders`,
      );

      for (const reminder of relationData.eventReminders) {
        const userEventReminder = {
          userEventId: mainEntity.id,
          remindBefore: reminder.remindBefore,
          notifyMethod: reminder.notifyMethod,
          status: reminder.status,
        };

        this.logger.log(`Creating reminder:`, userEventReminder);
        promises.push(this.userEventReminderService.create(userEventReminder));
      }
    }

    // Create event offerings
    if (relationData?.eventOfferings?.length) {
      this.logger.log(
        `Creating ${relationData.eventOfferings.length} event offerings`,
      );

      for (const offering of relationData.eventOfferings) {
        const userEventOffering = {
          userEventId: mainEntity.id,
          offeringName: offering.offeringName,
          quantity: offering.quantity,
          note: offering.note,
        };

        this.logger.log(`Creating offering:`, userEventOffering);
        promises.push(this.userEventOfferingService.create(userEventOffering));
      }
    }

    if (promises.length > 0) {
      const results = await Promise.all(promises);
      this.logger.log(
        `Successfully created ${results.length} relationship records`,
      );
    } else {
      this.logger.log('No relationships to create');
    }
  }

  protected async updateRelationships(
    manager: EntityManager,
    mainEntity: UserEvent,
    relationData?: Record<string, any>,
  ): Promise<void> {
    const promises: Promise<any>[] = [];

    // Handle eventReminders - check if field exists in relationData
    if (relationData && 'eventReminders' in relationData) {
      const existingReminders =
        await this.userEventReminderService.findAllByOptions({
          userEventId: mainEntity.id,
        });
      const inputReminder = relationData.eventReminders || [];

      if (inputReminder.length === 0) {
        // Xóa tất cả reminders hiện có nếu không truyền gì
        for (const reminder of existingReminders ?? []) {
          promises.push(this.userEventReminderService.remove(reminder.id));
        }
      } else {
        // Logic xử lý bình thường
        const existingMap = new Map(
          (existingReminders ?? []).map((o) => [o.id, o]),
        );
        const inputMap = new Map(inputReminder.map((r) => [r.id, r]));

        // Find what to add, update, and remove
        const toAdd = inputReminder.filter(
          (input) => !input.id || !existingMap.has(input.id),
        );
        const toRemove = (existingReminders ?? []).filter(
          (existing) => !inputMap.has(existing.id),
        );
        const toUpdate = inputReminder.filter((input) => {
          if (!input.id) return false; // Không update items mới
          const existing = existingMap.get(input.id);
          return (
            existing &&
            (existing.remindBefore !== input.remindBefore ||
              existing.notifyMethod !== input.notifyMethod ||
              existing.status !== input.status)
          );
        });

        // Execute changes
        for (const reminder of toAdd) {
          promises.push(
            this.userEventReminderService.create({
              userEventId: mainEntity.id,
              remindBefore: reminder.remindBefore,
              notifyMethod: reminder.notifyMethod,
              status: reminder.status,
            }),
          );
        }

        for (const reminder of toRemove) {
          promises.push(this.userEventReminderService.remove(reminder.id));
        }

        for (const reminder of toUpdate) {
          if (reminder.id) {
            promises.push(
              this.userEventReminderService.update(reminder.id, {
                remindBefore: reminder.remindBefore,
                notifyMethod: reminder.notifyMethod,
                status: reminder.status,
              }),
            );
          }
        }
      }
    }

    // Handle eventOfferings - check if field exists in relationData
    if (relationData && 'eventOfferings' in relationData) {
      const existingOfferings =
        await this.userEventOfferingService.findAllByOptions({
          userEventId: mainEntity.id,
        });
      const inputOfferings = relationData.eventOfferings || [];

      if (inputOfferings.length === 0) {
        // Xóa tất cả offerings hiện có nếu không truyền gì
        for (const offering of existingOfferings ?? []) {
          promises.push(this.userEventOfferingService.remove(offering.id));
        }
      } else {
        // Logic xử lý bình thường
        const existingMap = new Map(
          (existingOfferings ?? []).map((o) => [o.id, o]),
        );
        const inputMap = new Map(inputOfferings.map((r) => [r.id, r]));

        // Find what to add, update, and remove
        const toAdd = inputOfferings.filter(
          (input) => !input.id || !existingMap.has(input.id),
        );
        const toRemove = (existingOfferings ?? []).filter(
          (existing) => !inputMap.has(existing.id),
        );
        const toUpdate = inputOfferings.filter((input) => {
          if (!input.id) return false; // Không update items mới
          const existing = existingMap.get(input.id);
          return (
            existing &&
            (existing.offeringName !== input.offeringName ||
              existing.quantity !== input.quantity ||
              existing.note !== input.note)
          );
        });

        // Execute changes
        for (const offering of toAdd) {
          promises.push(
            this.userEventOfferingService.create({
              userEventId: mainEntity.id,
              offeringName: offering.offeringName,
              quantity: offering.quantity,
              note: offering.note,
            }),
          );
        }
        for (const offering of toRemove) {
          promises.push(this.userEventOfferingService.remove(offering.id));
        }
        for (const offering of toUpdate) {
          if (offering.id) {
            promises.push(
              this.userEventOfferingService.update(offering.id, {
                offeringName: offering.offeringName,
                quantity: offering.quantity,
                note: offering.note,
              }),
            );
          }
        }
      }
    }
    if (promises.length > 0) {
      await Promise.all(promises);
      this.logger.log(
        `Optimized update completed: ${promises.length} operations`,
      );
    }
  }

  /**
   * Sync user event to Google Calendar
   */
  async syncToGoogleCalendar(
    eventId: string,
    googleRefreshToken: string,
  ): Promise<any> {
    const event = await this.findOne(eventId, ['user']);
    if (!event) {
      throw new BadRequestException('Event not found');
    }

    try {
      // Build Google Calendar event
      const eventDate = new Date(event.eventDate);
      const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000); // +1 hour

      const calendarEvent = {
        summary: event.title,
        description: event.description,
        location: event.location,
        start: {
          dateTime: eventDate.toISOString(),
          timeZone: 'Asia/Ho_Chi_Minh',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'Asia/Ho_Chi_Minh',
        },
      };

      // Create event in Google Calendar
      const result = await this.googleCalendarService.createEvent(
        googleRefreshToken,
        'primary',
        calendarEvent,
      );

      this.logger.log(
        `Event ${eventId} synced to Google Calendar: ${result.id}`,
      );

      return {
        success: true,
        message: 'Event synced to Google Calendar successfully',
        googleEventId: result.id,
        googleEventLink: result.htmlLink,
      };
    } catch (error) {
      this.logger.error(
        `Failed to sync event ${eventId} to Google Calendar: ${error.message}`,
      );
      throw new BadRequestException(
        `Failed to sync to Google Calendar: ${error.message}`,
      );
    }
  }
}
