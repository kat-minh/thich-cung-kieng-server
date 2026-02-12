// google-calendar.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class GoogleCalendarService {
  constructor(private configService: ConfigService) {}
  private getOAuthClient(refreshToken: string) {
    const { OAuth2 } = google.auth;
    const oAuth2Client = new OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
    );
    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    return oAuth2Client;
  }

  async createEvent(
    refreshToken: string,
    calendarId = 'primary',
    eventBody: any,
  ) {
    const auth = this.getOAuthClient(refreshToken);
    const calendar = google.calendar({ version: 'v3', auth });
    const res = await calendar.events.insert({
      calendarId,
      requestBody: eventBody,
    });
    return res.data; // chứa id, htmlLink, start, end...
  }

  async updateEvent(
    refreshToken: string,
    calendarId = 'primary',
    eventId: string,
    eventBody: any,
  ) {
    const auth = this.getOAuthClient(refreshToken);
    const calendar = google.calendar({ version: 'v3', auth });
    const res = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: eventBody,
    });
    return res.data;
  }

  async deleteEvent(
    refreshToken: string,
    calendarId = 'primary',
    eventId: string,
  ) {
    const auth = this.getOAuthClient(refreshToken);
    const calendar = google.calendar({ version: 'v3', auth });
    await calendar.events.delete({
      calendarId,
      eventId,
    });
    return true;
  }

  async getEventsSince(
    refreshToken: string,
    calendarId = 'primary',
    params: any = {},
  ) {
    const auth = this.getOAuthClient(refreshToken);
    const calendar = google.calendar({ version: 'v3', auth });
    const res = await calendar.events.list({
      calendarId,
      showDeleted: true,
      singleEvents: true,
      orderBy: 'startTime',
      ...params, // e.g. timeMin, pageToken, syncToken
    });
    return res.data; // items, nextPageToken, nextSyncToken
  }
}
