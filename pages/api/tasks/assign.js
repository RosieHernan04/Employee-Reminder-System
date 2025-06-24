import { db } from '../../../dataconnect/firebase';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { taskId, employeeEmails, taskDetails } = req.body;

    // Get task details from Firestore
    const taskRef = doc(db, 'employee_tasks', taskId);
    const taskDoc = await getDoc(taskRef);
    
    if (!taskDoc.exists()) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = taskDoc.data();
    
    // Create email transporter with the working configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Generate task link
    const taskLink = `${process.env.NEXT_PUBLIC_APP_URL}/tasks/${taskId}`;

    // Format deadline date
    const formatDeadline = (deadline) => {
      if (!deadline) return 'Not specified';
      
      let date;
      if (deadline.toDate) {
        date = deadline.toDate();
      } else if (deadline.seconds) {
        date = new Date(deadline.seconds * 1000);
      } else {
        date = new Date(deadline);
      }

      if (isNaN(date.getTime())) return 'Not specified';

      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Manila'
      });
    };

    // Send emails to all assigned employees
    const emailPromises = employeeEmails.map(async (email) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `New Task Assignment: ${task.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">New Task Assignment</h2>
            <p>You have been assigned a new task:</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Title:</strong> ${task.title}</p>
              <p><strong>Description:</strong> ${task.description}</p>
              <p><strong>Priority:</strong> ${task.priority}</p>
              <p><strong>Deadline:</strong> ${formatDeadline(task.deadline)}</p>
            </div>
            <p>Click the button below to view task details:</p>
            <a href="${taskLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">View Task Details</a>
            <br>
            <a href="https://employee-reminder-system.vercel.app" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">Go to Website</a>
            <p style="color: #6c757d; font-size: 0.9em;">Please complete this task by the specified deadline.</p>
            <hr style="margin: 24px 0;">
            <p style="font-size: 0.9em; color: #888;">
              Visit our website: 
              <a href="https://employee-reminder-system.vercel.app" style="color: #007bff;">https://employee-reminder-system.vercel.app</a>
            </p>
          </div>
        `
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);

    await addDoc(collection(db, 'taskAssignments'), {
      taskId,
      employeeEmails,
      assignedAt: new Date(),
      status: 'assigned'
    });

    res.status(200).json({ 
      message: 'Task assignments sent successfully',
      taskLink 
    });
  } catch (error) {
    console.error('Error sending task assignments:', error);
    res.status(500).json({ message: 'Error sending task assignments' });
  }
}