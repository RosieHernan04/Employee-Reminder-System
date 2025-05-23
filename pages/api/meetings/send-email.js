import emailService from '../../../lib/emailService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Add detailed logging for debugging
  console.log('Email API received payload:', req.body);

  try {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      console.error('Validation error: Missing required fields', { to, subject, body });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log('Sending email to:', to);

    await emailService.send({ to, subject, body });

    console.log('Email sent successfully to:', to);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
}
