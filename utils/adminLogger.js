import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../dataconnect/firebase';

export const logAdminActivity = async (adminId, adminName, action, details, entityType, entityId) => {
  try {
    await addDoc(collection(db, 'admin_activity'), {
      adminId,
      adminName,
      action,
      details,
      entityType,
      entityId,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
};

export const ADMIN_ACTIONS = {
  TASK_COMPLETED: 'TASK_COMPLETED',
  TASK_CREATED: 'TASK_CREATED',
  TASK_UPDATED: 'TASK_UPDATED',
  TASK_DELETED: 'TASK_DELETED',
  MEETING_CREATED: 'MEETING_CREATED',
  MEETING_UPDATED: 'MEETING_UPDATED',
  MEETING_DELETED: 'MEETING_DELETED',
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
}; 