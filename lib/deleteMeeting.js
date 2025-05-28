// lib/deleteMeeting.js

import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const deleteMeetingAndEmployeeCopies = async (meeting) => {
  try {
    const meetingRef = doc(db, 'meetings', meeting.id);
    await deleteDoc(meetingRef);

    const employeeMeetingsQuery = query(
      collection(db, 'employee_meetings'),
      where('title', '==', meeting.title),
      where('start', '==', meeting.start)
    );

    const snapshot = await getDocs(employeeMeetingsQuery);
    snapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    console.log('Meeting and all employee copies deleted successfully.');
  } catch (error) {
    console.error('Error deleting meeting and employee copies:', error);
  }
};

export default deleteMeetingAndEmployeeCopies;
