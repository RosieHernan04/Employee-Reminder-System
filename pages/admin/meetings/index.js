import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout/layout';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../../dataconnect/firebase';

export default function MeetingsList() {
  const router = useRouter();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMeetings() {
      try {
        const meetingsQuery = query(
          collection(db, 'meetings'),
          orderBy('datetime', 'desc')
        );
        const querySnapshot = await getDocs(meetingsQuery);
        const meetingsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          datetime: doc.data().datetime?.toDate() || new Date()
        }));
        setMeetings(meetingsData);
      } catch (err) {
        console.error('Error fetching meetings:', err);
        setError('Failed to load meetings');
      } finally {
        setLoading(false);
      }
    }

    fetchMeetings();
  }, []);

  const handleInvite = (meetingId) => {
    router.push(`/admin/meetings/invite?id=${meetingId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading meetings...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container py-5">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Meetings</h2>
          <button
            className="btn btn-primary"
            onClick={() => router.push('/admin/meetings/create')}
          >
            Create Meeting
          </button>
        </div>

        {meetings.length === 0 ? (
          <div className="alert alert-info">
            No meetings found. Create a new meeting to get started.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Location</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map(meeting => (
                  <tr key={meeting.id}>
                    <td>{meeting.title}</td>
                    <td>{meeting.datetime.toLocaleDateString()}</td>
                    <td>{meeting.datetime.toLocaleTimeString()}</td>
                    <td>{meeting.location}</td>
                    <td>{meeting.duration}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => handleInvite(meeting.id)}
                      >
                        Invite
                      </button>
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => router.push(`/admin/meetings/${meeting.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
} 