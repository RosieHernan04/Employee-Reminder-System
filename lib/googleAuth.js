// /lib/googleAuth.js
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// ----- AUTH SERVICE -----
export const googleAuthService = {
  generateAuthUrl: () => {
    const scopes = ['https://www.googleapis.com/auth/calendar'];
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
    });
  },

  getToken: async (code) => {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  },

  setCredentials: (tokens) => {
    oauth2Client.setCredentials(tokens);
  },
};

// ----- CALENDAR SERVICE -----
export const googleCalendarService = {
  listEvents: async () => {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return res.data.items;
  },

  createEvent: async (event) => {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const res = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    return res.data;
  },

  updateEvent: async (eventId, event) => {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const res = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      resource: event,
    });
    return res.data;
  },

  deleteEvent: async (eventId) => {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });
  },
};
