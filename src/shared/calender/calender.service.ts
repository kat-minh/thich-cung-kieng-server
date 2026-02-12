import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { CreateCalendarEventDto } from './dto/create-calender.dto';
import { UpdateCalendarEventDto } from './dto/update-calender.dto';

@Injectable()
export class CalenderService {
  private readonly logger = new Logger(CalenderService.name);
  private calendar;

  constructor(private readonly configService: ConfigService) {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          type: this.configService.get<string>('googleCalendar.type'),
          project_id: this.configService.get<string>(
            'googleCalendar.projectId',
          ),
          private_key_id: this.configService.get<string>(
            'googleCalendar.privateKeyId',
          ),
          private_key: this.configService
            .get<string>('googleCalendar.privateKey')
            ?.replace(/\\n/g, '\n'),
          client_email: this.configService.get<string>(
            'googleCalendar.clientEmail',
          ),
          client_id: this.configService.get<string>('googleCalendar.clientId'),
        },
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });
      this.calendar = google.calendar({ version: 'v3', auth });
      this.logger.log('Google Calendar service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Google Calendar service:', error);
    }
  }

  async createEvent(eventData: CreateCalendarEventDto) {
    try {
      const event = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.startDateTime,
          timeZone: eventData.timeZone || 'Asia/Ho_Chi_Minh',
        },
        end: {
          dateTime: eventData.endDateTime,
          timeZone: eventData.timeZone || 'Asia/Ho_Chi_Minh',
        },
        attendees: eventData.attendees?.map((email) => ({ email })),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
        location: eventData.location,
      };

      const response = await this.calendar.events.insert({
        calendarId: eventData.calendarId || 'primary',
        resource: event,
        sendUpdates: 'all', // Send email notifications to attendees
      });

      this.logger.log(`Event created: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create calendar event:', error);
      throw error;
    }
  }

  async updateEvent(eventId: string, eventData: UpdateCalendarEventDto) {
    try {
      const event = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.startDateTime,
          timeZone: eventData.timeZone || 'Asia/Ho_Chi_Minh',
        },
        end: {
          dateTime: eventData.endDateTime,
          timeZone: eventData.timeZone || 'Asia/Ho_Chi_Minh',
        },
        attendees: eventData.attendees?.map((email) => ({ email })),
        location: eventData.location,
      };

      const response = await this.calendar.events.update({
        calendarId: eventData.calendarId || 'primary',
        eventId: eventId,
        resource: event,
        sendUpdates: 'all',
      });

      this.logger.log(`Event updated: ${eventId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to update calendar event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId: string, calendarId = 'primary') {
    try {
      await this.calendar.events.delete({
        calendarId: calendarId,
        eventId: eventId,
        sendUpdates: 'all',
      });

      this.logger.log(`Event deleted: ${eventId}`);
    } catch (error) {
      this.logger.error('Failed to delete calendar event:', error);
      throw error;
    }
  }

  async getEvent(eventId: string, calendarId = 'primary') {
    try {
      const response = await this.calendar.events.get({
        calendarId: calendarId,
        eventId: eventId,
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to get calendar event:', error);
      throw error;
    }
  }

  async listEvents(
    calendarId = 'primary',
    timeMin?: string,
    timeMax?: string,
    maxResults = 10,
  ) {
    try {
      const response = await this.calendar.events.list({
        calendarId: calendarId,
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax,
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      this.logger.error('Failed to list calendar events:', error);
      throw error;
    }
  }

  /**
   * Create calendar event for ritual/ceremony reminder
   */
  async createRitualReminder(ritualData: {
    title: string;
    description: string;
    ritualDate: Date;
    userEmail: string;
    location?: string;
    duration?: number; // in minutes, default 120
  }) {
    const startDateTime = ritualData.ritualDate.toISOString();
    const duration = ritualData.duration || 120; // 2 hours default
    const endDateTime = new Date(
      ritualData.ritualDate.getTime() + duration * 60000,
    ).toISOString();

    return this.createEvent({
      title: `🙏 ${ritualData.title}`,
      description: `${ritualData.description}\n\n📅 Lịch cúng được tạo từ ứng dụng Thích Cúng Kiêng`,
      startDateTime,
      endDateTime,
      location: ritualData.location,
      attendees: [ritualData.userEmail],
      timeZone: 'Asia/Ho_Chi_Minh',
    });
  }
}
