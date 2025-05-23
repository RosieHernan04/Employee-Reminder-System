import { db } from '../../../lib/firebase-admin'; // Use Firebase Admin SDK
import { getDocs, query, where, collection } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  const { userId, action } = req.query;

  console.log("✅ Dashboard API called for userId:", userId); // Log the userId

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    console.log("🔥 STARTING DASHBOARD DATA FETCH for user:", userId);

    const now = new Date();

    // ===== Initialize Metrics =====
    let totalTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;
    let upcomingMeetings = 0;
    let progressTable = [];

    // ===== Fetch employee_tasks =====
    let employeeTasksCount = 0;
    let employeeTasksCompleted = 0;
    let employeeTasksOverdue = 0;
    try {
      console.log("📁 Fetching employee_tasks...");
      const empSnapshot = await getDocs(
        query(collection(db, 'employee_tasks'), where('assignedTo.uid', '==', userId))
      );
      console.log("🔍 employee_tasks count:", empSnapshot.size);

      empSnapshot.forEach(doc => {
        const data = doc.data();
        console.log("📄 employee_tasks document:", data); // Log each document
        const deadline = data.deadline?.toDate?.();
        const validDeadline = deadline instanceof Date && !isNaN(deadline);

        employeeTasksCount++;
        if (data.status === 'completed') employeeTasksCompleted++;
        if (data.status !== 'completed' && validDeadline && deadline < now) employeeTasksOverdue++;

        progressTable.push({
          id: doc.id,
          title: data.title || 'N/A',
          description: data.description || '',
          deadline: validDeadline ? deadline.toISOString().split('T')[0] : '2099-12-31',
          priority: data.priority?.toLowerCase() || 'low',
          status: data.status || 'pending',
          type: 'Assigned Task',
          source: data.createdBy?.name || 'Unknown',
        });
      });
    } catch (err) {
      console.error("❌ Error in employee_tasks query:", err);
    }

    // ===== Fetch tasks =====
    let selfTasksCount = 0;
    let selfTasksCompleted = 0;
    let selfTasksOverdue = 0;
    try {
      console.log("📁 Fetching tasks...");
      const tasksSnapshot = await getDocs(
        query(collection(db, 'tasks'), where('userId', '==', userId))
      );
      console.log("🔍 tasks count:", tasksSnapshot.size);

      tasksSnapshot.forEach(doc => {
        const data = doc.data();
        console.log("📄 tasks document:", data); // Log each document
        const dueDate = data.dueDate?.toDate?.();
        const validDueDate = dueDate instanceof Date && !isNaN(dueDate);

        selfTasksCount++;
        if (data.status === 'completed') selfTasksCompleted++;
        if (data.status !== 'completed' && validDueDate && dueDate < now) selfTasksOverdue++;

        progressTable.push({
          id: doc.id,
          title: data.title || 'N/A',
          description: data.description || '',
          deadline: validDueDate ? dueDate.toISOString().split('T')[0] : '2099-12-31',
          priority: data.priority?.toLowerCase() || 'low',
          status: data.status || 'pending',
          type: 'Self Task',
          source: 'You',
        });
      });
    } catch (err) {
      console.error("❌ Error in tasks query:", err);
    }

    // ===== Fetch employee_meetings =====
    let meetingsCount = 0;
    try {
      console.log("📁 Fetching employee_meetings...");
      const meetingsSnapshot = await getDocs(
        query(collection(db, 'employee_meetings'), where('userId', '==', userId))
      );
      console.log("🔍 employee_meetings count:", meetingsSnapshot.size);

      meetingsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log("📄 employee_meetings document:", data); // Log each document
        const start = data.start?.toDate?.();
        const validStart = start instanceof Date && !isNaN(start);

        if (['pending', 'scheduled', 'confirmed'].includes(data.status?.toLowerCase())) {
          meetingsCount++;
        }

        progressTable.push({
          id: doc.id,
          title: data.title || 'N/A',
          description: data.description || '',
          deadline: validStart ? start.toISOString().split('T')[0] : '2099-12-31',
          priority: 'medium',
          status: data.status || 'pending',
          type: 'Meeting',
          source: data.assignedBy?.name || 'You',
        });
      });
    } catch (err) {
      console.error("❌ Error in employee_meetings query:", err);
    }

    if (action === 'sendReminders') {
      try {
        console.log("📧 Sending reminders for userId:", userId);

        const reminders = progressTable.filter(item => {
          const reminderDate = new Date(item.deadline);
          return reminderDate > now && reminderDate <= new Date(now.getTime() + 24 * 60 * 60 * 1000); // Within 24 hours
        });

        if (reminders.length === 0) {
          return res.status(200).json({ message: "No reminders to send" });
        }

        const transporter = nodemailer.createTransport({
          service: 'gmail', // Or your preferred email service
          auth: {
            user: process.env.EMAIL_USER, // Your email address
            pass: process.env.EMAIL_PASS, // Your email password or app-specific password
          },
        });

        for (const reminder of reminders) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userId, // Assuming userId is the email address
            subject: `Reminder: ${reminder.title}`,
            text: `You have an upcoming ${reminder.type} titled "${reminder.title}" scheduled for ${reminder.deadline}.`,
          };

          await transporter.sendMail(mailOptions);
          console.log("✅ Reminder email sent for:", reminder.title);
        }

        return res.status(200).json({ message: "Reminders sent successfully" });
      } catch (err) {
        console.error("❌ Error sending reminders:", err);
        return res.status(500).json({ error: "Failed to send reminders" });
      }
    }

    // ===== Build Dashboard Response =====
    progressTable = progressTable
      .filter(item => item.deadline) // Ensure valid deadlines
      .sort((a, b) => new Date(b.deadline) - new Date(a.deadline))
      .slice(0, 10);

    const responsePayload = {
      totalTasks: employeeTasksCount + selfTasksCount,
      completedTasks: employeeTasksCompleted + selfTasksCompleted,
      overdueTasks: employeeTasksOverdue + selfTasksOverdue,
      upcomingMeetings: meetingsCount,
      progressTable,
    };

    console.log("📦 Final dashboard data:", responsePayload);

    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error("Dashboard API error:", err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
}
