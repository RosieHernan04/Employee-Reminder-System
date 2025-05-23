import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../dataconnect/firebase';

export const checkDeadlineNotifications = async () => {
  try {
    const now = new Date();
    const adminTasksRef = collection(db, 'admin_tasks');
    
    // Get all active admin tasks
    const q = query(
      adminTasksRef,
      where('status', '!=', 'completed'),
      where('status', '!=', 'cancelled')
    );

    const querySnapshot = await getDocs(q);
    const notifications = [];

    querySnapshot.forEach((doc) => {
      const task = { id: doc.id, ...doc.data() };
      const deadline = task.deadline.toDate();
      const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

      // Check if we should send a notification based on reminderDays setting
      if (daysUntilDeadline <= task.notifications?.reminderDays && daysUntilDeadline > 0) {
        notifications.push({
          type: 'deadline',
          task: task,
          daysRemaining: daysUntilDeadline,
          message: `Task "${task.title}" is due in ${daysUntilDeadline} day${daysUntilDeadline === 1 ? '' : 's'}`
        });
      }

      // Check for overdue tasks
      if (daysUntilDeadline < 0) {
        notifications.push({
          type: 'overdue',
          task: task,
          daysOverdue: Math.abs(daysUntilDeadline),
          message: `Task "${task.title}" is overdue by ${Math.abs(daysUntilDeadline)} day${Math.abs(daysUntilDeadline) === 1 ? '' : 's'}`
        });
      }
    });

    return notifications;
  } catch (error) {
    console.error('Error checking for notifications:', error);
    return [];
  }
};

export const sendNotification = async (notification) => {
  // Here you would implement the actual notification sending logic
  // This could include:
  // 1. Email notifications using a service like SendGrid
  // 2. Push notifications using a service like Firebase Cloud Messaging
  // 3. In-app notifications stored in Firestore
  
  if (notification.task.notifications?.email) {
    // Send email notification
    console.log('Sending email notification:', notification.message);
  }

  if (notification.task.notifications?.push) {
    // Send push notification
    console.log('Sending push notification:', notification.message);
  }

  // Store notification in Firestore
  try {
    await addDoc(collection(db, 'notifications'), {
      taskId: notification.task.id,
      message: notification.message,
      type: notification.type,
      createdAt: serverTimestamp(),
      read: false
    });
  } catch (error) {
    console.error('Error storing notification:', error);
  }
};

// Function to check and send notifications
export const processNotifications = async () => {
  const notifications = await checkDeadlineNotifications();
  
  for (const notification of notifications) {
    await sendNotification(notification);
  }
  
  return notifications.length;
}; 