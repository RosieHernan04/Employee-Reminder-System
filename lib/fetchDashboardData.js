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

  // Count completed tasks from employee_tasks
  const completedEmployeeTasksSnap = await getDocs(
    query(collection(db, 'employee_tasks'), where('status', '==', 'completed'))
  );
  const completedEmployeeTasks = completedEmployeeTasksSnap.size;

  // Count completed tasks from admin_tasks
  const completedAdminTasksSnap = await getDocs(
    query(collection(db, 'admin_tasks'), where('status', '==', 'completed'))
  );
  const completedAdminTasks = completedAdminTasksSnap.size;

  // Get total users
  const usersSnapshot = await getDocs(collection(db, 'users'));
  const usersCount = usersSnapshot.size;

  return {
    pendingTasks: pendingTasksCount,
    completedTasks: completedEmployeeTasks + completedAdminTasks,
    incomingMeetings: upcomingMeetingsCount,
    totalUsers: usersCount
  };
};