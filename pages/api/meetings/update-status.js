import { db } from '../../../lib/firebase.ts';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { meetingId, status } = req.body;

    if (!meetingId || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Update the meeting status in the meetings collection
    const meetingRef = doc(db, 'meetings', meetingId);
    const meetingDoc = await getDoc(meetingRef);

    if (!meetingDoc.exists()) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Update the meeting status
    await updateDoc(meetingRef, {
      status,
      lastUpdated: new Date()
    });

    // Get all meeting invitations for this meeting
    const invitationsQuery = query(
      collection(db, 'meetingInvitations'),
      where('meetingId', '==', meetingId)
    );
    const invitationsSnapshot = await getDocs(invitationsQuery);

    // Update status in employee_meetings collection for all invited employees
    for (const invitationDoc of invitationsSnapshot.docs) {
      const invitation = invitationDoc.data();
      const employeeMeetingsQuery = query(
        collection(db, 'employee_meetings'),
        where('meetingId', '==', meetingId)
      );
      const employeeMeetingsSnapshot = await getDocs(employeeMeetingsQuery);

      for (const employeeMeetingDoc of employeeMeetingsSnapshot.docs) {
        await updateDoc(doc(db, 'employee_meetings', employeeMeetingDoc.id), {
          status,
          lastUpdated: new Date()
        });
      }
    }

    return res.status(200).json({
      message: 'Meeting status updated successfully',
      meeting: {
        id: meetingId,
        ...meetingDoc.data(),
        status
      }
    });

  } catch (error) {
    console.error('Error updating meeting status:', error);
    return res.status(500).json({ 
      message: 'Failed to update meeting status',
      error: error.message || 'Unknown error occurred'
    });
  }
} 