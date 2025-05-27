import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../dataconnect/firebase';

export default function MeetingDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchMeeting = async () => {
      try {
        const meetingRef = doc(db, 'meetings', id);
        const meetingDoc = await getDoc(meetingRef);

        if (!meetingDoc.exists()) {
          setError('Meeting not found');
          setLoading(false);
          return;
        }

        const meetingData = meetingDoc.data();
        setMeeting({
          id: meetingDoc.id,
          ...meetingData,
          datetime: meetingData.datetime?.toDate() || new Date()
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching meeting:', error);
        setError('Error fetching meeting details');
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h2 className="mb-0">Meeting Details</h2>
              </div>
              <div className="card-body">
                <h3 className="card-title">{meeting.title}</h3>
                <div className="mb-4">
                  <p className="mb-1"><strong>Date:</strong> {formatDate(meeting.datetime)}</p>
                  <p className="mb-1"><strong>Time:</strong> {formatTime(meeting.datetime)}</p>
                  <p className="mb-1"><strong>Location:</strong> {meeting.location}</p>
                  <p className="mb-1"><strong>Duration:</strong> {meeting.duration}</p>
                  <p className="mb-1"><strong>Type:</strong> {meeting.type}</p>
                  <p className="mb-1"><strong>Status:</strong> 
                    <span className={`badge ${getStatusBadgeClass(meeting.status)} ms-2`}>
                      {meeting.status}
                    </span>
                  </p>
                </div>
                {meeting.description && (
                  <div className="mb-4">
                    <h4>Description</h4>
                    <p>{meeting.description}</p>
                  </div>
                )}
                {meeting.agenda && (
                  <div className="mb-4">
                    <h4>Agenda</h4>
                    <ul className="list-group">
                      {meeting.agenda.map((item, index) => (
                        <li key={index} className="list-group-item">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'scheduled':
      return 'bg-primary';
    case 'in-progress':
      return 'bg-warning';
    case 'completed':
      return 'bg-success';
    case 'cancelled':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
}; 