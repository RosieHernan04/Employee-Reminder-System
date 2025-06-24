import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import nodemailer from "nodemailer";
import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";

const EMAIL_USER = defineSecret("EMAIL_USER");
const EMAIL_PASSWORD = defineSecret("EMAIL_PASSWORD");

admin.initializeApp();

// Update Task and Meeting types to include two reminder flags
type Task = {
  title: string;
  description?: string;
  collection: string;
  deadline?: FirebaseFirestore.Timestamp;
  dueDate?: FirebaseFirestore.Timestamp;
  notifications?: { reminderDays?: number };
  assignedTo?: { email?: string; id?: string };
  createdBy?: { email?: string };
  createdById?: string;
  _ref?: FirebaseFirestore.DocumentReference;
  reminderSent?: boolean;
  reminderSent_30min?: boolean;
  reminderSent_custom?: boolean;
  status?: string; // <-- Add this line
};

// Meeting type
type Meeting = {
  title: string;
  date?: string;
  reminderTime?: string;
  emailNotifications?: boolean;
  userId?: string;
  _ref?: FirebaseFirestore.DocumentReference;
  reminderSent?: boolean;
  reminderSent_30min?: boolean;
  reminderSent_custom?: boolean;
  status?: string; // <-- Add this line
};

// Fetch tasks from all collections (including admin_tasks)
async function getAllTasks(): Promise<Task[]> {
  const taskSnap = await admin.firestore().collection("tasks").get();
  const employeeTaskSnap = await admin.firestore().collection("employee_tasks").get();
  const adminTaskSnap = await admin.firestore().collection("admin_tasks").get();

  const personalTasks = taskSnap.docs.map(doc => ({
    ...doc.data(),
    collection: "tasks",
    _ref: doc.ref,
    reminderSent: doc.data().reminderSent
  })) as Task[];

  const employeeTasks = employeeTaskSnap.docs.map(doc => ({
    ...doc.data(),
    collection: "employee_tasks",
    _ref: doc.ref,
    reminderSent: doc.data().reminderSent
  })) as Task[];

  const adminTasks = adminTaskSnap.docs.map(doc => ({
    ...doc.data(),
    collection: "admin_tasks",
    _ref: doc.ref,
    reminderSent: doc.data().reminderSent
  })) as Task[];

  return [...personalTasks, ...employeeTasks, ...adminTasks];
}

// Fetch admin's own meetings
async function getAdminMeetings(): Promise<Meeting[]> {
  const adminMeetingsSnap = await admin.firestore().collection("meetings").get();
  return adminMeetingsSnap.docs.map(doc => ({
    ...doc.data(),
    _ref: doc.ref,
  })) as Meeting[];
}

// Fetch employee meetings (admin-assigned and employee-created)
async function getEmployeeMeetings(): Promise<any[]> {
  const snap = await admin.firestore().collection("employee_meetings").get();
  return snap.docs.map(doc => ({
    ...doc.data(),
    _ref: doc.ref,
  }));
}

// Helper function to fetch user email from Firestore
async function getUserEmail(userId: string): Promise<string | undefined> {
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  return userDoc.data()?.email;
}

// Helper function to send meeting reminder
async function sendMeetingReminder(meeting: Meeting, transporter: nodemailer.Transporter, recipientEmail: string): Promise<void> {
  const mailOptions = {
    from: EMAIL_USER.value(),
    to: recipientEmail,
    subject: `⏰ Reminder: ${meeting.title}`,
    text: `Hello,

This is a friendly reminder for your upcoming meeting.

📝 Title: ${meeting.title}
📅 Date: ${meeting.date}
⏰ Time: ${meeting.reminderTime}

Please make sure to attend this meeting.

You can access the system here:
https://employee-reminder-system.vercel.app

Thank you,
Task Management System`,
  };

  await transporter.sendMail(mailOptions);
}

// Helper function to send push notification
async function sendPushNotification(token: string, title: string, body: string) {
  const message = {
    notification: {
      title,
      body,
    },
    data: {
      title,
      body,
    },
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    logger.info(`✅ Push notification sent: ${response}`);
  } catch (error) {
    logger.error("❌ Failed to send push notification", error);
  }
}

// Reminder function (runs every 5 minutes)
export const sendReminderEmail = onSchedule(
  {
    schedule: "every 2 minutes",
    timeZone: "Asia/Manila",
    secrets: [EMAIL_USER, EMAIL_PASSWORD],
  },
  async () => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER.value(),
        pass: EMAIL_PASSWORD.value(),
      },
    });

    const allTasks: Task[] = await getAllTasks();

    for (const task of allTasks) {
      logger.info(`Processing task: ${task.title}`);

      // Support deadline for admin_tasks as well
      const deadline = (task.collection === "employee_tasks" || task.collection === "admin_tasks")
        ? task.deadline?.toDate()
        : task.dueDate?.toDate();

      if (!deadline) {
        logger.warn(`No deadline for task: ${task.title}`);
        continue;
      }

      // --- Skip if task is completed ---
      if (task.status === 'completed') {
        logger.info(`Task is completed, skipping: ${task.title}`);
        continue;
      }

      // Determine recipient email
      let recipientEmail: string | undefined;

      if (task.collection === "employee_tasks") {
        recipientEmail = task.assignedTo?.email;
      } else if (task.collection === "admin_tasks") {
        // For admin's own tasks, use createdBy.email or createdById
        if (task.createdBy?.email) {
          recipientEmail = task.createdBy.email;
        } else if (task.createdById) {
          recipientEmail = await getUserEmail(task.createdById);
        }
      } else {
        if (typeof (task as any).userId === "string") {
          recipientEmail = await getUserEmail((task as any).userId);
        }
      }

      if (!recipientEmail) {
        logger.warn(`No recipient email for task: ${task.title}`);
        continue;
      }
      logger.info(`Recipient email: ${recipientEmail}`);

      // Calculate reminder times
      let reminderDays: number | undefined;
      if (typeof (task as any).reminderDays === 'number') {
        reminderDays = (task as any).reminderDays;
      } else if (task.notifications?.reminderDays) {
        reminderDays = task.notifications.reminderDays;
      }

      // Default 30min reminder
      const reminderTime_30min = new Date(deadline.getTime() - 30 * 60 * 1000);
      // Custom reminder
      let reminderTime_custom: Date | undefined = undefined;
      if (typeof reminderDays === 'number' && !isNaN(reminderDays)) {
        reminderTime_custom = new Date(deadline.getTime());
        reminderTime_custom.setDate(reminderTime_custom.getDate() - reminderDays);
      }

      const now = new Date();

      // --- 1. Default 30min reminder ---
      if (!task.reminderSent_30min && now >= reminderTime_30min && now < deadline) {
        // Format deadline for email
        const formattedDeadline = deadline.toLocaleString("en-US", {
          timeZone: "Asia/Manila",
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const mailOptions = {
          from: EMAIL_USER.value(),
          to: recipientEmail,
          subject: `⏰ Reminder: ${task.title}`,
          text: `Hello,

This is a friendly reminder for your upcoming task.

📝 Title: ${task.title}
📄 Description: ${task.description || "No description provided."}
📅 Deadline: ${formattedDeadline}

Please make sure to complete this task before the deadline.

You can access the system here:
https://employee-reminder-system.vercel.app

Thank you,
Task Management System`,
        };

        try {
          await transporter.sendMail(mailOptions);
          logger.info(`30min reminder email sent for task: ${task.title}`);

          // --- Push Notification for Task ---
          let userId: string | undefined;

          if (task.collection === "employee_tasks") {
            if ((task as any).userId) {
              userId = (task as any).userId;
            } else if (task.assignedTo?.id) {
              userId = task.assignedTo.id;
            } else if (task.assignedTo?.email) {
              const userSnap = await admin
                .firestore()
                .collection("users")
                .where("email", "==", task.assignedTo.email)
                .limit(1)
                .get();

              if (!userSnap.empty) {
                userId = userSnap.docs[0].id;
                logger.info(`🔍 Found userId by email: ${userId}`);
              } else {
                logger.warn(`⚠️ No user found with email: ${task.assignedTo.email}`);
              }
            }
          } else if (task.collection === "admin_tasks" && task.createdById) {
            userId = task.createdById;
          } else if ((task as any).userId) {
            userId = (task as any).userId;
          }

          if (userId) {
            const userDoc = await admin.firestore().collection("users").doc(userId).get();
            const fcmToken = userDoc.data()?.fcmToken;
            if (fcmToken) {
              await sendPushNotification(
                fcmToken,
                `⏰ Reminder: ${task.title}`,
                `Due at ${formattedDeadline}`
              );
            }
          }
          // --- End Push Notification for Task ---

          if (task._ref) {
            await task._ref.update({ reminderSent_30min: true });
            logger.info(`reminderSent_30min flag updated for task: ${task.title}`);
          }
        } catch (error) {
          logger.error(`Error sending 30min reminder for task: ${task.title}`, error);
        }
      }

      // --- 2. Custom reminderDays reminder ---
      if (
        reminderTime_custom &&
        !task.reminderSent_custom &&
        now >= reminderTime_custom &&
        now < deadline
      ) {
        // Format deadline for email
        const formattedDeadline = deadline.toLocaleString("en-US", {
          timeZone: "Asia/Manila",
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const mailOptions = {
          from: EMAIL_USER.value(),
          to: recipientEmail,
          subject: `⏰ Reminder: ${task.title}`,
          text: `Hello,

This is a friendly reminder for your upcoming task.

📝 Title: ${task.title}
📄 Description: ${task.description || "No description provided."}
📅 Deadline: ${formattedDeadline}

Please make sure to complete this task before the deadline.

You can access the system here:
https://employee-reminder-system.vercel.app

Thank you,
Task Management System`,
        };

        try {
          await transporter.sendMail(mailOptions);
          logger.info(`Custom reminderDays email sent for task: ${task.title}`);

          // --- Push Notification for Task ---
          let userId: string | undefined;

          if (task.collection === "employee_tasks") {
            if ((task as any).userId) {
              userId = (task as any).userId;
            } else if (task.assignedTo?.id) {
              userId = task.assignedTo.id;
            } else if (task.assignedTo?.email) {
              const userSnap = await admin
                .firestore()
                .collection("users")
                .where("email", "==", task.assignedTo.email)
                .limit(1)
                .get();

              if (!userSnap.empty) {
                userId = userSnap.docs[0].id;
                logger.info(`🔍 Found userId by email: ${userId}`);
              } else {
                logger.warn(`⚠️ No user found with email: ${task.assignedTo.email}`);
              }
            }
          } else if (task.collection === "admin_tasks" && task.createdById) {
            userId = task.createdById;
          } else if ((task as any).userId) {
            userId = (task as any).userId;
          }

          if (userId) {
            const userDoc = await admin.firestore().collection("users").doc(userId).get();
            const fcmToken = userDoc.data()?.fcmToken;
            if (fcmToken) {
              await sendPushNotification(
                fcmToken,
                `⏰ Reminder: ${task.title}`,
                `Due at ${formattedDeadline}`
              );
            }
          }
          // --- End Push Notification for Task ---

          if (task._ref) {
            await task._ref.update({ reminderSent_custom: true });
            logger.info(`reminderSent_custom flag updated for task: ${task.title}`);
          }
        } catch (error) {
          logger.error(`Error sending custom reminder for task: ${task.title}`, error);
        }
      }
    }

    // --- Process Admin's Own Meetings from 'meetings' collection ---
    const adminMeetings: Meeting[] = await getAdminMeetings();
    const now = new Date();
    const windowStart = new Date(now.getTime() - 5 * 60 * 1000); // 5 mins before now

    for (const meeting of adminMeetings) {
      // --- Skip if meeting is completed ---
      if (meeting.status === 'completed') {
        logger.info(`Admin meeting is completed, skipping: ${meeting.title}`);
        continue;
      }

      if (meeting.reminderSent || meeting.emailNotifications === false) continue;

      if (!meeting.date || !meeting.reminderTime) {
        logger.warn(`Missing date or reminderTime for admin meeting: ${meeting.title}`);
        continue;
      }

      // Use reminderDays if present, otherwise default to 30 minutes
      let reminderDays: number | undefined = (meeting as any).reminderDays;
      const meetingDateTime = new Date(`${meeting.date}T${meeting.reminderTime}:00+08:00`);
      const reminderTime_30min = new Date(meetingDateTime.getTime() - 30 * 60 * 1000);
      let reminderTime_custom: Date | undefined = undefined;
      if (typeof reminderDays === 'number' && !isNaN(reminderDays)) {
        reminderTime_custom = new Date(meetingDateTime.getTime());
        reminderTime_custom.setDate(reminderTime_custom.getDate() - reminderDays);
      }

      // --- 1. Default 30min reminder ---
      if (
        !meeting.reminderSent_30min &&
        reminderTime_30min >= windowStart &&
        reminderTime_30min <= now &&
        now < meetingDateTime
      ) {
        // Check if meeting.userId is defined before calling getUserEmail
        let recipientEmail: string | undefined = undefined;
        if (meeting.userId) {
          recipientEmail = await getUserEmail(meeting.userId);
        }

        if (!recipientEmail) {
          logger.warn(`No email found for admin userId ${meeting.userId}`);
          continue;
        }

        try {
          await sendMeetingReminder(meeting, transporter, recipientEmail);
          logger.info(`30min reminder email sent for admin's meeting: ${meeting.title}`);

          // --- Push Notification for Admin Meeting ---
          if (meeting.userId) {
            const userDoc = await admin.firestore().collection("users").doc(meeting.userId).get();
            const fcmToken = userDoc.data()?.fcmToken;
            if (fcmToken) {
              await sendPushNotification(
                fcmToken,
                `⏰ Reminder: ${meeting.title}`,
                `Meeting at ${meeting.reminderTime}`
              );
            }
          }
          // --- End Push Notification for Admin Meeting ---

          if (meeting._ref) {
            await meeting._ref.update({ reminderSent_30min: true });
          }
        } catch (err) {
          logger.error(`Error sending 30min admin meeting reminder for: ${meeting.title}`, err);
        }
      }

      // --- 2. Custom reminderDays reminder ---
      if (
        reminderTime_custom &&
        !meeting.reminderSent_custom &&
        reminderTime_custom >= windowStart &&
        reminderTime_custom <= now &&
        now < meetingDateTime
      ) {
        let recipientEmail: string | undefined = undefined;
        if (meeting.userId) {
          recipientEmail = await getUserEmail(meeting.userId);
        }

        if (!recipientEmail) {
          logger.warn(`No email found for admin userId ${meeting.userId}`);
          continue;
        }

        try {
          await sendMeetingReminder(meeting, transporter, recipientEmail);
          logger.info(`Custom reminderDays email sent for admin's meeting: ${meeting.title}`);

          // --- Push Notification for Admin Meeting ---
          if (meeting.userId) {
            const userDoc = await admin.firestore().collection("users").doc(meeting.userId).get();
            const fcmToken = userDoc.data()?.fcmToken;
            if (fcmToken) {
              await sendPushNotification(
                fcmToken,
                `⏰ Reminder: ${meeting.title}`,
                `Meeting at ${meeting.reminderTime}`
              );
            }
          }
          // --- End Push Notification for Admin Meeting ---

          if (meeting._ref) {
            await meeting._ref.update({ reminderSent_custom: true });
          }
        } catch (err) {
          logger.error(`Error sending custom admin meeting reminder for: ${meeting.title}`, err);
        }
      }
    }

    // --- Process Employee Meetings (admin-assigned and employee-created) ---
    const employeeMeetings = await getEmployeeMeetings();
    const timezone = "Asia/Manila";
    for (const meeting of employeeMeetings) {
      // --- Skip if meeting is completed ---
      if (meeting.status === 'completed') {
        logger.info(`Employee meeting is completed, skipping: ${meeting.title}`);
        continue;
      }

      if (meeting.reminderSent === true) continue;

      if (!meeting.start) {
        logger.warn(`Missing start for employee meeting: ${meeting.title}`);
        continue;
      }

      // Use reminderDays if present, otherwise default to 30 minutes
      let reminderDays: number | undefined = (meeting as any).reminderDays;
      const meetingStart: Date = meeting.start.toDate ? meeting.start.toDate() : new Date(meeting.start);
      const reminderTime_30min = new Date(meetingStart.getTime() - 30 * 60 * 1000);
      let reminderTime_custom: Date | undefined = undefined;
      if (typeof reminderDays === 'number' && !isNaN(reminderDays)) {
        reminderTime_custom = new Date(meetingStart.getTime());
        reminderTime_custom.setDate(reminderTime_custom.getDate() - reminderDays);
      }

      // --- 1. Default 30min reminder ---
      if (
        !meeting.reminderSent_30min &&
        reminderTime_30min >= windowStart &&
        reminderTime_30min <= now &&
        now < meetingStart
      ) {
        // Determine recipient email
        let recipientEmail: string | undefined = undefined;
        if (meeting.assignedTo?.email) {
          recipientEmail = meeting.assignedTo.email;
        } else if (meeting.createdBy?.email) {
          recipientEmail = meeting.createdBy.email;
        } else if (meeting.createdBy?.id) {
          recipientEmail = await getUserEmail(meeting.createdBy.id);
        } else if (meeting.userId) {
          recipientEmail = await getUserEmail(meeting.userId);
        }

        if (!recipientEmail) {
          logger.debug(`Meeting missing recipient email`, meeting);
          logger.warn(`No recipient email for employee meeting: ${meeting.title}`);
          continue;
        }

        // Format date and time in Asia/Manila timezone using native JS
        const formattedDate = meetingStart.toLocaleDateString("en-US", {
          timeZone: timezone,
          year: "numeric",
          month: "long",
          day: "2-digit",
          weekday: "long"
        });
        const formattedTime = meetingStart.toLocaleTimeString("en-US", {
          timeZone: timezone,
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        });

        // Compose mail with description and link
        let meetingLink = "No meeting link provided.";
        // Employee-created: has userId (string), no assignedTo, has "link" (string)
        if (
          typeof meeting.userId === "string" &&
          !meeting.assignedTo &&
          typeof meeting.link === "string" &&
          meeting.link.trim() !== ""
        ) {
          meetingLink = meeting.link;
        } else if (
          typeof meeting.meetingLink === "string" &&
          meeting.meetingLink.trim() !== ""
        ) {
          // Admin-assigned: use meetingLink if present
          meetingLink = meeting.meetingLink;
        }

        const mailOptions = {
          from: EMAIL_USER.value(),
          to: recipientEmail,
          subject: `⏰ Reminder: ${meeting.title}`,
          text: `Hello,

This is a friendly reminder for your upcoming meeting.

📝 Title: ${meeting.title}
📅 Date: ${formattedDate}
⏰ Time: ${formattedTime}
📝 Description: ${meeting.description || "No description provided."}
🔗 Link: ${meetingLink}

Please make sure to attend this meeting.

You can access the system here:
https://employee-reminder-system.vercel.app

Thank you,
Task Management System`,
        };

        try {
          await transporter.sendMail(mailOptions);
          logger.info(`30min reminder email sent for employee meeting: ${meeting.title}`);

          // --- Push Notification for Employee Meeting ---
          let userId: string | undefined = undefined;
          if (meeting.assignedTo?.id) {
            userId = meeting.assignedTo.id;
          } else if (meeting.createdBy?.id) {
            userId = meeting.createdBy.id;
          } else if (meeting.userId) {
            userId = meeting.userId;
          }
          if (userId) {
            const userDoc = await admin.firestore().collection("users").doc(userId).get();
            const fcmToken = userDoc.data()?.fcmToken;
            if (fcmToken) {
              await sendPushNotification(
                fcmToken,
                `⏰ Reminder: ${meeting.title}`,
                `Meeting at ${formattedTime}`
              );
            }
          }
          // --- End Push Notification for Employee Meeting ---

          if (meeting._ref) {
            await meeting._ref.update({ reminderSent_30min: true });
          }
        } catch (err) {
          logger.error(`Error sending 30min employee meeting reminder for: ${meeting.title}`, err);
        }
      }

      // --- 2. Custom reminderDays reminder ---
      if (
        reminderTime_custom &&
        !meeting.reminderSent_custom &&
        reminderTime_custom >= windowStart &&
        reminderTime_custom <= now &&
        now < meetingStart
      ) {
        let recipientEmail: string | undefined = undefined;
        if (meeting.assignedTo?.email) {
          recipientEmail = meeting.assignedTo.email;
        } else if (meeting.createdBy?.email) {
          recipientEmail = meeting.createdBy.email;
        } else if (meeting.createdBy?.id) {
          recipientEmail = await getUserEmail(meeting.createdBy.id);
        } else if (meeting.userId) {
          recipientEmail = await getUserEmail(meeting.userId);
        }

        if (!recipientEmail) {
          logger.debug(`Meeting missing recipient email`, meeting);
          logger.warn(`No recipient email for employee meeting: ${meeting.title}`);
          continue;
        }

        // Format date and time in Asia/Manila timezone using native JS
        const formattedDate = meetingStart.toLocaleDateString("en-US", {
          timeZone: timezone,
          year: "numeric",
          month: "long",
          day: "2-digit",
          weekday: "long"
        });
        const formattedTime = meetingStart.toLocaleTimeString("en-US", {
          timeZone: timezone,
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        });

        // Compose mail with description and link
        let meetingLink = "No meeting link provided.";
        if (
          typeof meeting.userId === "string" &&
          !meeting.assignedTo &&
          typeof meeting.link === "string" &&
          meeting.link.trim() !== ""
        ) {
          meetingLink = meeting.link;
        } else if (
          typeof meeting.meetingLink === "string" &&
          meeting.meetingLink.trim() !== ""
        ) {
          meetingLink = meeting.meetingLink;
        }

        const mailOptions = {
          from: EMAIL_USER.value(),
          to: recipientEmail,
          subject: `⏰ Reminder: ${meeting.title}`,
          text: `Hello,

This is a friendly reminder for your upcoming meeting.

📝 Title: ${meeting.title}
📅 Date: ${formattedDate}
⏰ Time: ${formattedTime}
📝 Description: ${meeting.description || "No description provided."}
🔗 Link: ${meetingLink}

Please make sure to attend this meeting.

You can access the system here:
https://employee-reminder-system.vercel.app

Thank you,
Task Management System`,
        };

        try {
          await transporter.sendMail(mailOptions);
          logger.info(`Custom reminderDays email sent for employee meeting: ${meeting.title}`);

          // --- Push Notification for Employee Meeting ---
          let userId: string | undefined = undefined;
          if (meeting.assignedTo?.id) {
            userId = meeting.assignedTo.id;
          } else if (meeting.createdBy?.id) {
            userId = meeting.createdBy.id;
          } else if (meeting.userId) {
            userId = meeting.userId;
          }
          if (userId) {
            const userDoc = await admin.firestore().collection("users").doc(userId).get();
            const fcmToken = userDoc.data()?.fcmToken;
            if (fcmToken) {
              await sendPushNotification(
                fcmToken,
                `⏰ Reminder: ${meeting.title}`,
                `Meeting at ${formattedTime}`
              );
            }
          }
          // --- End Push Notification for Employee Meeting ---

          if (meeting._ref) {
            await meeting._ref.update({ reminderSent_custom: true });
          }
        } catch (err) {
          logger.error(`Error sending custom employee meeting reminder for: ${meeting.title}`, err);
        }
      }
    }
  }
);
