import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../dataconnect/firebase';

// Function to assign a task to an employee and log the action
export const assignTaskToEmployee = async (taskId, taskData, employeeData, assignedBy) => {
  try {
    // Logic to assign task to employee
    // Add your task assignment logic here

    // Log the task assignment in admin_activity
    await addDoc(collection(db, 'admin_activity'), {
      action: 'TASK_ASSIGNED',
      assignedBy: assignedBy,
      taskId: taskId,
      employeeId: employeeData.uid,
      employeeName: employeeData.fullName,
      timestamp: serverTimestamp(),
      details: `Task "${taskData.title}" assigned to ${employeeData.fullName}`
    });
  } catch (error) {
    console.error('Error assigning task:', error);
  }
};