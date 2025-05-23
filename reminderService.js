const nodemailer = require('nodemailer');

function scheduleReminders(task) {
    // Schedule default 30-minute reminder
    const defaultReminderTime = new Date(task.dueDate);
    defaultReminderTime.setMinutes(defaultReminderTime.getMinutes() - 30);
    scheduleEmail(task, defaultReminderTime, "Default 30-minute reminder");

    // Schedule custom reminders set by admin
    if (task.customReminderDays) {
        task.customReminderDays.forEach((days) => {
            const customReminderTime = new Date(task.dueDate);
            customReminderTime.setDate(customReminderTime.getDate() - days);
            scheduleEmail(task, customReminderTime, `Custom reminder ${days} days before`);
        });
    }
}

function scheduleEmail(task, reminderTime, message) {
    const now = new Date();
    const delay = reminderTime - now;

    if (delay > 0) {
        setTimeout(() => {
            sendEmail(task, message);
        }, delay);
    }
}

function sendEmail(task, message) {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Replace with your email service
        auth: {
            user: 'your-email@gmail.com', // Replace with your email
            pass: 'your-email-password', // Replace with your email password
        },
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: 'recipient-email@gmail.com', // Replace with the recipient's email
        subject: `Reminder: ${task.name}`,
        text: `${message}\n\nTask: ${task.name}\nDue Date: ${task.dueDate}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

module.exports = { scheduleReminders };