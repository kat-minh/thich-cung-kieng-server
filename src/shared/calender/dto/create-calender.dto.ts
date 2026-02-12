export class CreateCalendarEventDto {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  attendees?: string[];
  timeZone?: string;
  calendarId?: string;
}
