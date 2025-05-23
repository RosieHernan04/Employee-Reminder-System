import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

export const setupActivityListeners = (userId, callbacks) => {
  const {
    onEmployeeActivitiesUpdate,
    onAdminAssignedActivitiesUpdate,
  } = callbacks;

  // Fetch completed meetings (employee activity)
  const completedMeetingsQuery = query(
    collection(db, 'employee_meetings'),
    where('userId', '==', userId),
    where('status', '==', 'completed'),
    orderBy('completedAt', 'desc'),
    limit(5)
  );

  const unsubCompletedMeetings = onSnapshot(completedMeetingsQuery, (snapshot) => {
    const meetings = snapshot.docs.map(doc => ({
      id: doc.id + '-meeting',
      type: 'meeting',
      title: doc.data().title,
      description: `Attended meeting: ${doc.data().title}`,
      timestamp: doc.data().completedAt?.toDate() || new Date(),
      raw: doc.data()
    }));
    onEmployeeActivitiesUpdate('meetings', meetings);
  });

  // Fetch submitted tasks (employee activity)
  const submittedTasksQuery = query(
    collection(db, 'employee_tasks'),
    where('userId', '==', userId),
    where('type', '!=', 'assigned'),
    orderBy('createdAt', 'desc'),
    limit(5)
  );

  const unsubSubmittedTasks = onSnapshot(submittedTasksQuery, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id + '-task',
      type: 'task',
      title: doc.data().title,
      description: `Submitted task: ${doc.data().title}`,
      timestamp: doc.data().createdAt?.toDate() || new Date(),
      raw: doc.data()
    }));
    onEmployeeActivitiesUpdate('tasks', tasks);
  });

  // Fetch admin-assigned tasks
  const assignedTasksQuery = query(
    collection(db, 'employee_tasks'),
    where('userId', '==', userId),
    where('type', '==', 'assigned'),
    orderBy('assignedAt', 'desc'),
    limit(5)
  );

  const unsubAssignedTasks = onSnapshot(assignedTasksQuery, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id + '-assigned-task',
      type: 'assigned-task',
      title: doc.data().title,
      description: `Admin assigned task: ${doc.data().title}`,
      timestamp: doc.data().assignedAt?.toDate() || doc.data().createdAt?.toDate() || new Date(),
      raw: doc.data()
    }));
    onAdminAssignedActivitiesUpdate('tasks', tasks);
  });

  // Fetch admin-assigned meetings
  const adminAssignedMeetingsQuery = query(
    collection(db, 'employee_meetings'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(10)
  );

  const unsubAdminAssignedMeetings = onSnapshot(adminAssignedMeetingsQuery, (snapshot) => {
    const meetings = snapshot.docs
      .map(doc => ({
        id: doc.id + '-assigned-meeting',
        type: 'assigned-meeting',
        title: doc.data().title,
        description: `Admin assigned meeting: ${doc.data().title}`,
        timestamp: doc.data().createdAt?.toDate() || new Date(),
        createdBy: doc.data().createdBy,
        raw: doc.data()
      }))
      .filter(m => m.createdBy && m.createdBy !== userId); // Only admin-assigned

    onAdminAssignedActivitiesUpdate('meetings', meetings);
  });

  // Return cleanup function
  return () => {
    unsubCompletedMeetings();
    unsubSubmittedTasks();
    unsubAssignedTasks();
    unsubAdminAssignedMeetings();
  };
}; 