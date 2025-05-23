const { google } = require('googleapis');

class GoogleCalendarService {
    constructor() {
        this.calendar = google.calendar({ version: 'v3' });
    }

    async initialize(auth) {
        this.calendar = google.calendar({ version: 'v3', auth });
    }

    async listEvents(timeMin, timeMax) {
        try {
            const response = await this.calendar.events.list({
                calendarId: 'primary',
                timeMin: timeMin.toISOString(),
                timeMax: timeMax.toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
            });
            return response.data.items;
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    }

    async createEvent(event) {
        try {
            const response = await this.calendar.events.insert({
                calendarId: 'primary',
                resource: event,
            });
            return response.data;
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    }

    async updateEvent(eventId, event) {
        try {
            const response = await this.calendar.events.update({
                calendarId: 'primary',
                eventId: eventId,
                resource: event,
            });
            return response.data;
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    }

    async deleteEvent(eventId) {
        try {
            await this.calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId,
            });
            return true;
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    }
}

module.exports = new GoogleCalendarService(); 