import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout/Layout.js';
import { db } from '../../../lib/firebase.ts';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import Link from 'next/link';


export default function MeetingStatus() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const q = query(collection(db, 'meetings'));
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

  const handleStatusChange = async (meetingId, newStatus) => {
    setLoading(true);
    try {
      const meetingRef = doc(db, 'meetings', meetingId);
      await updateDoc(meetingRef, {
        status: newStatus,
        updatedAt: new Date()
      });

      // Update local state
      setMeetings(prev => prev.map(meeting => 
        meeting.id === meetingId 
          ? { ...meeting, status: newStatus }
          : meeting
      ));

      alert('Meeting status updated successfully!');
    } catch (error) {
      console.error('Error updating meeting status:', error);
      alert('Error updating meeting status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'scheduled':
        return 'status-badge scheduled';
      case 'in-progress':
        return 'status-badge in-progress';
      case 'completed':
        return 'status-badge completed';
      case 'cancelled':
        return 'status-badge cancelled';
      default:
        return 'status-badge default';
    }
  };

  return (
    <Layout>
      <div className="container py-4">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/admin/dashboard">Dashboard</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/admin/usermanagement">User Management</Link>
            </li>
            <li className="breadcrumb-item active">Meeting Status</li>
          </ol>
        </nav>

        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card animated-card">
              <div className="card-header gradient-header">
                <h4 className="mb-0">Meeting Status Management</h4>
              </div>
              <div className="card-body gradient-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Date & Time</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Current Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meetings.map(meeting => (
                        <tr key={meeting.id} className="meeting-row">
                          <td>{meeting.title}</td>
                          <td>{new Date(meeting.datetime).toLocaleString()}</td>
                          <td className="text-capitalize">{meeting.type}</td>
                          <td>{meeting.location}</td>
                          <td>
                            <span className={getStatusBadgeClass(meeting.status)}>
                              {meeting.status}
                            </span>
                          </td>
                          <td>
                            <div className="dropdown">
                              <button
                                className="btn btn-sm bubbly-button dropdown-toggle"
                                type="button"
                                id={`dropdown-${meeting.id}`}
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                disabled={loading}
                              >
                                Update Status
                              </button>
                              <ul className="dropdown-menu bubbly-dropdown" aria-labelledby={`dropdown-${meeting.id}`}>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleStatusChange(meeting.id, 'scheduled')}
                                  >
                                    <span className="status-dot scheduled"></span> Scheduled
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleStatusChange(meeting.id, 'in-progress')}
                                  >
                                    <span className="status-dot in-progress"></span> In Progress
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleStatusChange(meeting.id, 'completed')}
                                  >
                                    <span className="status-dot completed"></span> Completed
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleStatusChange(meeting.id, 'cancelled')}
                                  >
                                    <span className="status-dot cancelled"></span> Cancelled
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary bubbly-button"
                    onClick={() => router.back()}
                  >
                    Back
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
        
        .status-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-weight: 500;
          font-size: 0.85rem;
          color: white;
          text-transform: capitalize;
        }
        
        .status-badge.scheduled {
          background: linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%);
        }
        
        .status-badge.in-progress {
          background: linear-gradient(135deg, #ff9a44 0%, #fc6076 100%);
        }
        
        .status-badge.completed {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }
        
        .status-badge.cancelled {
          background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
        }
        
        .status-badge.default {
          background: linear-gradient(135deg, #6c757d 0%, #adb5bd 100%);
        }
        
        .bubbly-dropdown {
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          border: none;
          padding: 0.5rem;
          animation: fadeIn 0.3s ease-out;
        }
        
        .dropdown-item {
          border-radius: 8px;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }
        
        .dropdown-item:hover {
          background-color: #f8f9fa;
          transform: translateX(5px);
        }
        
        .status-dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 0.5rem;
        }
        
        .status-dot.scheduled {
          background: #4e54c8;
        }
        
        .status-dot.in-progress {
          background: #ff9a44;
        }
        
        .status-dot.completed {
          background: #43e97b;
        }
        
        .status-dot.cancelled {
          background: #ff416c;
        }
      `}</style>
    </Layout>
  );
} 