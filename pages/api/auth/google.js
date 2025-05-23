import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Missing ID token' });
    }

    // Verify the ID token
    const ticket = await oauth2Client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const userId = payload['sub'];

    // Create a new OAuth2Client for calendar access
    const calendarOAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set the credentials
    calendarOAuth2Client.setCredentials({
      access_token: idToken,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    // Get a new access token with calendar scope
    const { tokens } = await calendarOAuth2Client.refreshAccessToken();
    
    if (!tokens.access_token) {
      throw new Error('Failed to get access token');
    }

    return res.status(200).json({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ 
      error: 'Failed to authenticate with Google',
      details: error.message
    });
  }
} 