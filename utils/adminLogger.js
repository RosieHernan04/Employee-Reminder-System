import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../dataconnect/firebase';

export const logAdminActivity = async (adminId, adminName, action, details, entityType, entityId) => {
  try {
    // Fallbacks to avoid missing fields
    const logData = {
      adminId: adminId || null,
      adminName: adminName || 'System',
      action: action || 'UNKNOWN_ACTION',
      details: details || '',
      entityType: entityType || null,
      entityId: entityId || null,
      timestamp: serverTimestamp(),
    };
    await addDoc(collection(db, 'admin_activity'), logData);
    // Debug log for troubleshooting
    if (process.env.NODE_ENV !== 'production') {
      console.log('Admin activity logged:', logData);
    }
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
};

export const ADMIN_ACTIONS = {
  TASK_COMPLETED: 'TASK_COMPLETED',
  TASK_CREATED: 'TASK_CREATED',
  TASK_UPDATED: 'TASK_UPDATED',
  TASK_DELETED: 'TASK_DELETED',
  TASK_ASSIGNED: 'TASK_ASSIGNED', // <-- Add this line
  MEETING_CREATED: 'MEETING_CREATED',
  MEETING_UPDATED: 'MEETING_UPDATED',
  MEETING_DELETED: 'MEETING_DELETED',
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
};