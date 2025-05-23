import nodemailer from 'nodemailer';
import cron from 'node-cron';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { subject, to, html, reminderTime } = req.body;

    if (!subject || !to || !html) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Support both single and multiple recipients
    const recipients = Array.isArray(to) ? to.join(',') : to;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipients,
      subject,
      html
    };

    // Schedule a reminder email 30 minutes before the task deadline
    if (reminderTime) {
      const reminderDate = new Date(reminderTime);
      const reminderCronTime = new Date(reminderDate.getTime() - 30 * 60000); // 30 minutes before

      cron.schedule(reminderCronTime, async () => {
        try {
          await transporter.sendMail(mailOptions);
          console.log('Reminder email sent successfully');
        } catch (error) {
          console.error('Error sending reminder email:', error);
        }
      });
    }

    // Send the initial email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
} 