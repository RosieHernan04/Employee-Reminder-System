import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Logs an action to the employeeActivityLogs collection.
 * @param {string} employeeId - The ID of the employee performing the action.
 * @param {string} actionType - The type of action performed (e.g., "created_task", "completed_task").
 * @param {string} targetType - The type of target (e.g., "task", "meeting").
 * @param {string} targetId - The ID of the target (e.g., task ID or meeting ID).
 * @param {string} initiatedBy - The ID of the user who initiated the action.
 * @param {Object} metadata - Additional metadata related to the action.
 */
export const logEmployeeActivity = async (employeeId, actionType, targetType, targetId, initiatedBy, metadata = {}) => {
  try {
    const activityRef = collection(db, 'employeeActivityLogs');
    await addDoc(activityRef, {
      employeeId,
      actionType,
      targetType,
      targetId,
      initiatedBy,
      timestamp: serverTimestamp(),
      metadata,
    });
  } catch (err) {
    console.error('Error logging activity:', err);
  }
};
