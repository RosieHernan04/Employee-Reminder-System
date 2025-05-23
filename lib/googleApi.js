export const loadGoogleScript = () => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-js')) {
      console.log('Google API script already loaded');
      return resolve();
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.id = 'google-js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google API script loaded successfully');
      resolve();
    };
    script.onerror = (error) => {
      console.error('Failed to load Google API script:', error);
      reject(error);
    };
    document.body.appendChild(script);
  });
};

export const initClient = async () => {
  try {
    console.log('Initializing Google API client...');
    
    // Wait for gapi to be available
    if (!window.gapi) {
      throw new Error('Google API not loaded');
    }

    // Check if already initialized
    if (gapi.auth2 && gapi.auth2.getAuthInstance()) {
      console.log('Google API already initialized');
      return;
    }

    await new Promise((resolve, reject) => {
      gapi.load('client:auth2', async () => {
        try {
          await gapi.client.init({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            scope: [
              'https://www.googleapis.com/auth/calendar',
              'https://www.googleapis.com/auth/calendar.events',
              'https://www.googleapis.com/auth/calendar.events.readonly',
              'https://www.googleapis.com/auth/calendar.readonly'
            ].join(' '),
          });
          console.log('Google API client initialized successfully');
          resolve();
        } catch (error) {
          console.error('Error initializing Google API client:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error in initClient:', error);
    throw error;
  }
};
  