const nodemailer = require('nodemailer');

// Configure the email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
    }
});

// Function to send an email
function send(emailDetails) {
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: emailDetails.to,
        subject: emailDetails.subject,
        text: emailDetails.body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

module.exports = { send };
