import { google } from 'googleapis';

export async function createCalendarEvent(accessToken, eventData) {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary: eventData.title,
      description: eventData.description,
      start: {
        dateTime: eventData.startTime,
        timeZone: 'Asia/Manila',
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: 'Asia/Manila',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

export function formatEventData(data, type) {
  if (type === 'meeting') {
    return {
      title: data.title,
      description: data.description || '',
      startTime: data.startTime,
      endTime: data.endTime,
    };
  } else if (type === 'task') {
    return {
      title: data.title,
      description: data.description || '',
      startTime: data.dueDate,
      endTime: new Date(new Date(data.dueDate).getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
    };
  } else {
    throw new Error('Invalid event type');
  }
} 