import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export const assignTaskToEmployee = async (taskId, employeeId, employeeData) => {
  try {
    // Fetch the task from unassigned_tasks
    const taskRef = doc(db, 'unassigned_tasks', taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      throw new Error('Task not found');
    }

    const taskData = taskDoc.data();

    // ✅ Create a new document for this task assignment
    const newTaskRef = doc(collection(db, 'employee_tasks'));

    const newTaskData = {
      ...taskData,
      assignedTo: {
        uid: employeeId,
        name: employeeData.fullName,
        email: employeeData.email,
      },
      assignedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdAt: taskData.createdAt || serverTimestamp(),
      status: 'assigned',
      progress: 0,
      statusNotes: '',
      type: 'employee',
    };

    await setDoc(newTaskRef, newTaskData);

    // Optional: log the assignment activity
    await addDoc(collection(db, 'activity_logs'), {
      type: 'TASK_ASSIGNED',
      taskId,
      employeeId,
      employeeName: employeeData.fullName,
      employeeEmail: employeeData.email,
      timestamp: serverTimestamp(),
    });

    // Delete the original unassigned task
    await deleteDoc(taskRef);

    return {
      success: true,
      newTaskId: newTaskRef.id,
      message: `Task successfully assigned to ${employeeData.fullName}`,
    };
  } catch (error) {
    console.error('❌ Error assigning task to employee:', error);
    throw error;
  }
};