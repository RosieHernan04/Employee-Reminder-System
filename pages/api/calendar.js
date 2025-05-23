import { google } from 'googleapis';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { accessToken, eventData, type, action, eventId } = req.body;

        if (!accessToken) {
            return res.status(400).json({ error: 'Missing Google access token' });
        }

        // Verify the token
        const tokenResponse = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + accessToken);
        const tokenInfo = await tokenResponse.json();

        if (tokenInfo.error) {
            return res.status(401).json({ error: 'Invalid access token' });
        }

        // Safely check for calendar scope
        const scopes = tokenInfo.scope ? tokenInfo.scope.split(' ') : [];
        if (!scopes.includes('https://www.googleapis.com/auth/calendar')) {
            return res.status(403).json({ error: 'Calendar scope not granted' });
        }

        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });
        const calendar = google.calendar({ version: 'v3', auth });

        if (action === 'delete' && eventId) {
            // Handle event deletion
            await calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId
            });
            return res.status(200).json({ success: true, message: 'Event deleted successfully' });
        }

        // Handle event creation
        if (!eventData || !eventData.title || !eventData.startTime) {
            return res.status(400).json({ error: 'Missing required event data' });
        }

        const event = {
            summary: eventData.title,
            description: eventData.description || '',
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

        return res.status(200).json({ 
            success: true, 
            event: response.data,
            calendarEventId: response.data.id
        });
    } catch (error) {
        console.error('Calendar API error:', error);
        return res.status(500).json({ 
            error: error.message || 'Failed to process calendar event',
            details: error.response?.data?.error?.message || error.message
        });
    }
} 