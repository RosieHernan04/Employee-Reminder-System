import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const logActivity = async ({
  actorId,
  actorRole = 'employee',
  action,
  referenceId,
  description
}) => {
  try {
    await addDoc(collection(db, 'recent_activities'), {
      actorId,
      actorRole,
      action,
      referenceId,
      description,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Activity types
export const ACTIVITY_TYPES = {
  TASK_CREATED: 'created_task',
  TASK_COMPLETED: 'completed_task',
  MEETING_CREATED: 'created_meeting',
  MEETING_JOINED: 'joined_meeting',
  MEETING_COMPLETED: 'completed_meeting'
}; 