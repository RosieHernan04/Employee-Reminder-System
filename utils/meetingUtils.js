import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../dataconnect/firebase';

// ...existing code...

export const assignMeetingToEmployee = async (meetingId, meetingData, employeeData, admin) => {
  try {
    // Logic to assign meeting to employee
    // ...existing code...

    // Log the meeting assignment in admin_activity
    await addDoc(collection(db, 'admin_activity'), {
      action: 'MEETING_ASSIGNED',
      assignedBy: {
        uid: admin.uid,
        name: admin.name
      },
      meetingId: meetingId,
      employeeId: employeeData.uid,
      employeeName: employeeData.name,
      timestamp: serverTimestamp(),
      details: `Meeting "${meetingData.title}" assigned to ${employeeData.name}`
    });
  } catch (error) {
    console.error('Error assigning meeting:', error);
  }
};

// ...existing code...