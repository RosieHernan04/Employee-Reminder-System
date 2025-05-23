import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../dataconnect/firebase';

/**
 * Logs an admin activity to the admin_activity collection.
 * @param {string} action - The action type (e.g., 'TASK_CREATED', 'MEETING_ASSIGNED').
 * @param {string} adminName - The name of the admin performing the action.
 * @param {string} details - A description of the action.
 */
export const logAdminActivity = async (action, adminName, details) => {
  try {
    await addDoc(collection(db, 'admin_activity'), {
      timestamp: serverTimestamp(),
      adminName,
      action,
      details,
    });
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
};
