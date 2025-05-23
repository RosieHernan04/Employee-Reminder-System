import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { format } from "date-fns";
import { db } from "../../firebase";

const MeetingPage = ({ user }) => {
  const [allMeetings, setAllMeetings] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    const adminMeetingsQuery = query(
      collection(db, "admin_meetings"),
      where("assignedTo.uid", "==", user.uid)
    );

    const personalMeetingsQuery = query(
      collection(db, "personal_meetings"),
      where("userId", "==", user.uid)
    );

    const unsubscribeAdminMeetings = onSnapshot(adminMeetingsQuery, (snapshot) => {
      const adminMeetingsList = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description,
        date: doc.data().date ? doc.data().date.toDate() : null,
        time: doc.data().reminderTime || '09:00', // Use reminderTime for admin meetings
        type: "admin",
        priority: doc.data().priority,
        status: doc.data().status,
      }));

      setAllMeetings(prevMeetings => {
        const personalOnly = prevMeetings.filter(m => m.type === "personal");
        return [...personalOnly, ...adminMeetingsList];
      });
    });

    const unsubscribePersonalMeetings = onSnapshot(personalMeetingsQuery, (snapshot) => {
      const personalMeetingsList = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description,
        date: doc.data().date ? doc.data().date.toDate() : null,
        time: doc.data().time || '09:00', // Use time for personal meetings
        type: "personal",
        priority: doc.data().priority,
        status: doc.data().status,
      }));

      setAllMeetings(prevMeetings => {
        const adminOnly = prevMeetings.filter(m => m.type === "admin");
        return [...adminOnly, ...personalMeetingsList];
      });
    });

    return () => {
      unsubscribeAdminMeetings();
      unsubscribePersonalMeetings();
    };
  }, [user]);

  const formatDateForDisplay = (date, meeting) => {
    if (!date) return '';
    const displayTime = meeting.type === 'admin' ? meeting.reminderTime : meeting.time;
    return `${format(date, 'MMM dd, yyyy')} ${displayTime || format(date, 'HH:mm')}`;
  };

  return (
    <div>
      <h1>Meetings</h1>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Due Date</th>
            <th>Priority</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {allMeetings.map((meeting) => (
            <tr key={meeting.id}>
              <td>{meeting.title}</td>
              <td>{formatDateForDisplay(meeting.date, meeting)}</td>
              <td>{meeting.priority}</td>
              <td>{meeting.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MeetingPage;