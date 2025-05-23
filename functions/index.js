import functions from 'firebase-functions';
import nodemailer from 'nodemailer';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Configure the email transport using the default SMTP transport and a GMail account.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().gmail.email,
    pass: functions.config().gmail.password,
  },
});

// Cloud Function to send reminder emails
exports.sendReminderEmail = functions.pubsub.schedule("every 5 minutes").onRun(async (context) => {
  const now = new Date();
  const inFiveMin = new Date(now.getTime() + 5 * 60 * 1000); // Check within the next 5 minutes

  const collections = ['tasks', 'employee_tasks', 'employee_meetings']; // Add your collections here

  for (const collection of collections) {
    // Query all documents in each collection
    const snapshot = await db.collection(collection).get();

    snapshot.forEach(async (doc) => {
      const data = doc.data();
      const reminders = data.reminders || [];

      reminders.forEach(async (reminder, index) => {
        const reminderTime = new Date(reminder.time);

        // If the reminder is not sent and it's within the next 5 minutes
        if (!reminder.sent && reminderTime >= now && reminderTime <= inFiveMin) {
          try {
            // Send email notification
            const mailOptions = {
              from: functions.config().gmail.email,
              to: data.email, // Make sure email exists on the document
              subject: `Reminder: ${data.title || 'Task'} is coming up`,
              text: reminder.type === 'default'
                ? `Default reminder: Your task "${data.title}" is starting in 30 minutes.`
                : `Custom reminder: Your task "${data.title}" is due in ${reminder.daysBefore} day(s).`,
            };

            await transporter.sendMail(mailOptions);

            // Mark reminder as sent
            reminders[index].sent = true;
            await doc.ref.update({ reminders });
            console.log(`Email sent for ${data.title}`);

          } catch (error) {
            console.error(`Error sending email for ${data.title}:`, error);
          }
        }
      });
    });
  }
});

// Function to send reminder emails
exports.sendTaskReminder = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();

  // Fetch tasks from both collections
  const employeeTasksSnapshot = await db.collection('employee_tasks').get();
  const personalTasksSnapshot = await db.collection('tasks').get();

  const employeeTasks = employeeTasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), collection: 'employee_tasks' }));
  const personalTasks = personalTasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), collection: 'tasks' }));

  const allTasks = [...employeeTasks, ...personalTasks];

  allTasks.forEach(async (task) => {
    const deadline = task.collection === 'employee_tasks' ? task.deadline.toDate() : task.dueDate.toDate();
    const customReminderTime = new Date(deadline);
    customReminderTime.setDate(deadline.getDate() - (task.notifications?.reminderDays || 0));

    const defaultReminderTime = new Date(deadline);
    defaultReminderTime.setMinutes(deadline.getMinutes() - 30);

    if (now.toDate() >= customReminderTime || now.toDate() >= defaultReminderTime) {
      const recipientEmail = task.collection === 'employee_tasks' ? task.assignedTo.email : task.createdBy.email;
  const mailOptions = {
    from: functions.config().gmail.email,
        to: recipientEmail,
        subject: `Reminder: ${task.title}`,
        text: `This is a reminder for your task: ${task.title}.`,
  };

  try {
    await transporter.sendMail(mailOptions);
        console.log(`Reminder email sent for task: ${task.title}`);
  } catch (error) {
        console.error(`Error sending reminder email for task: ${task.title}`, error);
      }
  }
  });
});
