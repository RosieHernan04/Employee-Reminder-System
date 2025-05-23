import db from './db';

export async function getEmployeeMeetings(userId) {
  const snapshot = await db.collection('employee_meetings')
    .where('userId', '==', userId)
    .get();
  return snapshot.docs.map(doc => ({
    meetingId: doc.id,
    ...doc.data(),
    source: 'employee'
  }));
}

export async function getAdminMeetings(userId) {
  const snapshot = await db.collection('meetings')
    .where('invitedUsers', 'array-contains', userId)
    .get();
  return snapshot.docs.map(doc => ({
    meetingId: doc.id,
    ...doc.data(),
    source: 'admin'
  }));
}
