import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export const fetchDashboardData = async () => {
  const now = Timestamp.now();

  // Get upcoming meetings
  const meetingQuery = query(
    collection(db, 'meetings'),
    where('start', '>=', now)
  );
  const meetingsSnapshot = await getDocs(meetingQuery);
  const upcomingMeetingsCount = meetingsSnapshot.size;

  // Get pending tasks from both employee_tasks and admin_tasks
  const [employeePendingSnap, adminPendingSnap] = await Promise.all([
    getDocs(query(collection(db, 'employee_tasks'), where('status', 'in', ['assigned', 'pending']))),
    getDocs(query(collection(db, 'admin_tasks'), where('status', 'in', ['assigned', 'pending'])))
  ]);
  const pendingTasksCount = employeePendingSnap.size + adminPendingSnap.size;

  // Get completed tasks
  const completedTasksQuery = query(
    collection(db, 'employee_tasks'),
    where('status', '==', 'completed')
  );
  const completedTasksSnapshot = await getDocs(completedTasksQuery);
  const completedTasksCount = completedTasksSnapshot.size;

  // Get total users
  const usersSnapshot = await getDocs(collection(db, 'users'));
  const usersCount = usersSnapshot.size;

  return {
    pendingTasks: pendingTasksCount,
    completedTasks: completedTasksCount,
    incomingMeetings: upcomingMeetingsCount,
    totalUsers: usersCount
  };
};