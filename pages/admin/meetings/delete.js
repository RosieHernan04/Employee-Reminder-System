import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from 'lib/firebase';

const deleteMeetingAndEmployeeCopies = async (meeting) => {
  try {
    // Delete the original meeting
    const meetingRef = doc(db, 'meetings', meeting.id);
    await deleteDoc(meetingRef);

    // Find and delete employee copies
    const employeeMeetingsQuery = query(
      collection(db, 'employee_meetings'),
      where('title', '==', meeting.title),
      where('start', '==', meeting.start) // Ensure unique match
    );

    const snapshot = await getDocs(employeeMeetingsQuery);
    snapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref); // 🧹 Remove the duplicate
    });

    console.log('Meeting and all employee copies deleted successfully.');
  } catch (error) {
    console.error('Error deleting meeting and employee copies:', error);
  }
};

export default deleteMeetingAndEmployeeCopies;