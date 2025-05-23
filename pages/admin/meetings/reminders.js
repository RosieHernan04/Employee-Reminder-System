import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout/layout';
import { db } from '../../../lib/firebase.ts';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export default function MeetingReminders() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [selectedMeetings, setSelectedMeetings] = useState([]);
  const [reminderType, setReminderType] = useState('email');

  useEffect(() => {
    fetchUpcomingMeetings();
  }, []);

  const fetchUpcomingMeetings = async () => {
    try {
      const now = new Date();
      const q = query(
        collection(db, 'meetings'),
        where('status', '==', 'scheduled'),
        where('datetime', '>', now)
      );
      const querySnapshot = await getDocs(q);
      const meetingsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMeetings(meetingsList);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      alert('Error fetching meetings. Please try again.');
    }
  };

  const handleMeetingSelect = (meetingId) => {
    setSelectedMeetings(prev => {
      if (prev.includes(meetingId)) {
        return prev.filter(id => id !== meetingId);
      } else {
        return [...prev, meetingId];
      }
    });
  };

  const handleSendReminders = async () => {
    if (selectedMeetings.length === 0) {
      alert('Please select at least one meeting to send reminders for.');
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const updates = selectedMeetings.map(meetingId => {
        const meetingRef = doc(db, 'meetings', meetingId);
        return updateDoc(meetingRef, {
          lastReminderSent: now,
          reminderType: reminderType
        });
      });

      await Promise.all(updates);
      alert('Reminders sent successfully!');
      router.back();
    } catch (error) {
      console.error('Error sending reminders:', error);
      alert('Error sending reminders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-4">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/admin/dashboard">Dashboard</a>
            </li>
            <li className="breadcrumb-item">
              <a href="/admin/usermanagement">User Management</a>
            </li>
            <li className="breadcrumb-item active">Meeting Reminders</li>
          </ol>
        </nav>

        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card animated-card">
              <div className="card-header gradient-header">
                <h4 className="mb-0">Send Meeting Reminders</h4>
              </div>
              <div className="card-body gradient-body">
                <div className="reminder-type-selector mb-4">
                  <label className="form-label">Reminder Type</label>
                  <div className="btn-group w-100" role="group">
                    <input
                      type="radio"
                      className="btn-check"
                      name="reminderType"
                      id="email"
                      value="email"
                      checked={reminderType === 'email'}
                      onChange={(e) => setReminderType(e.target.value)}
                    />
                    <label className="btn bubbly-button" htmlFor="email">
                      <i className="bi bi-envelope me-2"></i>Email
                    </label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="reminderType"
                      id="push"
                      value="push"
                      checked={reminderType === 'push'}
                      onChange={(e) => setReminderType(e.target.value)}
                    />
                    <label className="btn bubbly-button" htmlFor="push">
                      <i className="bi bi-bell me-2"></i>Push Notification
                    </label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="reminderType"
                      id="both"
                      value="both"
                      checked={reminderType === 'both'}
                      onChange={(e) => setReminderType(e.target.value)}
                    />
                    <label className="btn bubbly-button" htmlFor="both">
                      <i className="bi bi-bell-fill me-2"></i>Both
                    </label>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th style={{ width: '50px' }}></th>
                        <th>Title</th>
                        <th>Date & Time</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Invited Employees</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meetings.map(meeting => (
                        <tr key={meeting.id} className="meeting-row">
                          <td>
                            <div className="form-check">
                              <input
                                className="form-check-input bubbly-checkbox"
                                type="checkbox"
                                checked={selectedMeetings.includes(meeting.id)}
                                onChange={() => handleMeetingSelect(meeting.id)}
                              />
                            </div>
                          </td>
                          <td>{meeting.title}</td>
                          <td>{new Date(meeting.datetime).toLocaleString()}</td>
                          <td className="text-capitalize">{meeting.type}</td>
                          <td>{meeting.location}</td>
                          <td>
                            {meeting.invitedEmployees?.length || 0} employees
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary bubbly-button me-md-2"
                    onClick={() => router.back()}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary bubbly-button"
                    onClick={handleSendReminders}
                    disabled={loading || selectedMeetings.length === 0}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Send Reminders
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animated-card {
          border: none;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          animation: fadeIn 0.5s ease-out;
        }
        
        .animated-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }
        
        .gradient-header {
          background: linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%);
          color: white;
          padding: 1.5rem;
          border-bottom: none;
        }
        
        .gradient-body {
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
          padding: 2rem;
        }
        
        .bubbly-button {
          padding: 0.5rem 1rem;
          font-weight: 500;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .bubbly-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%);
          border: none;
        }
        
        .btn-primary:hover {
          background: linear-gradient(135deg, #3f44a0 0%, #7a7fd9 100%);
        }
        
        .btn-secondary {
          background: linear-gradient(135deg, #6c757d 0%, #adb5bd 100%);
          border: none;
        }
        
        .btn-secondary:hover {
          background: linear-gradient(135deg, #5a6268 0%, #9aa1a9 100%);
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .table {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        
        .table th {
          background: #f8f9fa;
          border-bottom: 2px solid #e9ecef;
          color: #4e54c8;
          font-weight: 600;
          padding: 1rem;
        }
        
        .table td {
          padding: 1rem;
          vertical-align: middle;
        }
        
        .meeting-row {
          transition: all 0.2s ease;
        }
        
        .meeting-row:hover {
          background-color: #f8f9fa;
          transform: scale(1.01);
        }
        
        .reminder-type-selector {
          background: white;
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        
        .btn-check:checked + .bubbly-button {
          background: linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%);
          color: white;
        }
        
        .bubbly-checkbox {
          width: 1.2rem;
          height: 1.2rem;
          border-radius: 6px;
          border: 2px solid #4e54c8;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .bubbly-checkbox:checked {
          background-color: #4e54c8;
          border-color: #4e54c8;
        }
        
        .bubbly-checkbox:hover {
          transform: scale(1.1);
        }
        
        .form-label {
          color: #4e54c8;
          font-weight: 500;
          margin-bottom: 1rem;
        }
      `}</style>
    </Layout>
  );
} 