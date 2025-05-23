// /pages/api/meetings/invite.js

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { meetingId, meetingTitle, meetingDate, reminderTime, employeeEmails, description, priority, location, type, link } = req.body;

    // Debugging log to check the incoming request body
    console.log('Request body:', req.body);

    if (!meetingId || !meetingTitle || !meetingDate || !reminderTime || !employeeEmails?.length) {
      console.error('Missing required fields:', {
        meetingId: !!meetingId,
        meetingTitle: !!meetingTitle,
        meetingDate: !!meetingDate,
        reminderTime: !!reminderTime,
        employeeEmails: !!employeeEmails?.length,
      });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create email transporter with the working configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Helper function to format the date
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    // Map priority to readable format
    const formatPriority = (priority) => {
      const priorityMap = {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
      };
      return priorityMap[priority?.toLowerCase()] || 'Medium'; // Default to 'Medium' if priority is missing
    };

    // Send emails to all invited employees
    const emailPromises = employeeEmails.map(async (email) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Meeting Invitation: ${meetingTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">Meeting Invitation</h2>
            <p>You are invited to the following meeting:</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Title:</strong> ${meetingTitle}</p>
              <p><strong>Description:</strong> ${description || 'No description provided'}</p>
              <p><strong>Priority:</strong> ${formatPriority(priority)}</p>
              <p><strong>Date:</strong> ${formatDate(meetingDate)}</p>
              <p><strong>Time:</strong> ${reminderTime}</p>
              <p><strong>Location:</strong> ${
                type === 'virtual'
                  ? link
                    ? `<a href="${link}" target="_blank">Virtual Meeting Link</a>`
                    : 'Virtual Meeting (No link provided)'
                  : location || 'Not specified'
              }</p>
              ${
                type === 'virtual' && link
                  ? `<p><strong>Meeting Link:</strong> <a href="${link}" target="_blank">${link}</a></p>`
                  : ''
              }
            </div>
            <p>Please attend the meeting at the scheduled time.</p>
          </div>
        `,
      };

      console.log('Sending email to:', email); // Debugging log
      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);

    res.status(200).json({ message: 'Meeting invitations sent successfully' });
  } catch (error) {
    console.error('Error sending meeting invitations:', error); // Log the error for debugging
    res.status(500).json({ message: 'Error sending meeting invitations', error: error.message });
  }
}
