'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from 'components/MainLayout/Layout';
import { db } from '../../../lib/firebase.ts';
import { collection, query, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function EditDeleteMeeting() {
  const router = useRouter();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: '',
    location: '',
    duration: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const q = query(collection(db, 'meetings'));
      const querySnapshot = await getDocs(q);
      const meetingsList = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        // Use "date" for date column and "reminderTime" for time column
        let dateObj = data.date?.toDate ? data.date.toDate() : (typeof data.date === 'string' ? new Date(data.date) : new Date());
        let timeStr = data.reminderTime || '09:00';
        // Do not combine date and time for display, keep them separate
        return {
          id: docSnap.id,
          ...data,
          date: dateObj, // for date column
          reminderTime: timeStr // for time column
        };
      });
      setMeetings(meetingsList);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setError('Error fetching meetings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (meeting) => {
    if (meeting.status === 'completed') {
      alert('Cannot edit a completed meeting');
      return;
    }
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description,
      date: meeting.date ? meeting.date.toISOString().split('T')[0] : '',
      time: meeting.reminderTime || '09:00',
      type: meeting.type,
      location: meeting.location,
      duration: meeting.duration
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dateObj = new Date(formData.date);
      const [hours, minutes] = (formData.time || '09:00').split(':').map(Number);
      dateObj.setHours(hours || 0, minutes || 0, 0, 0);
      await updateDoc(doc(db, 'meetings', editingMeeting.id), {
        title: formData.title,
        description: formData.description,
        date: dateObj,
        reminderTime: formData.time,
        type: formData.type,
        location: formData.location,
        duration: formData.duration,
        updatedAt: new Date()
      });
      alert('Meeting updated successfully!');
      setEditingMeeting(null);
      fetchMeetings();
    } catch (error) {
      console.error('Error updating meeting:', error);
      setError('Error updating meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (meetingId) => {
    const meeting = meetings.find(m => m.id === meetingId);
    setMeetingToDelete(meeting);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!meetingToDelete) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'meetings', meetingToDelete.id));
      alert('Meeting deleted successfully!');
      fetchMeetings();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      setError('Error deleting meeting');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setMeetingToDelete(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-4">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4" style={{ backgroundColor: '#ffffff' }}>
        <h1 className="text-center mb-4 title">
          <i className="bi bi-calendar-check me-2"></i>
          Manage Meetings
        </h1>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <button
            className="btn btn-outline-secondary"
            onClick={() => router.push('/admin/meetingmanagement')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back
          </button>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="card shadow-sm glassmorphic" style={{ backgroundColor: '#DCCB9A' }}>
              <div className="card-header" style={{ backgroundColor: '#4A7C20', color: '#fff' }}>
                <h4 className="mb-0">Manage Meetings</h4>
              </div>
              <div className="card-body" style={{ backgroundColor: '#A9D84A' }}>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {editingMeeting ? (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h2>Edit Meeting</h2>
                    </div>
                    <form onSubmit={handleUpdate}>
                      <div className="mb-3">
                        <label htmlFor="title" className="form-label">Title</label>
                        <input
                          type="text"
                          className="form-control"
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="description" className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows="3"
                        />
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label htmlFor="date" className="form-label">Date</label>
                          <input
                            type="date"
                            className="form-control"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="time" className="form-label">Time</label>
                          <input
                            type="time"
                            className="form-control"
                            id="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="type" className="form-label">Meeting Type</label>
                        <select
                          className="form-select"
                          id="type"
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select type...</option>
                          <option value="Virtual">Virtual</option>
                          <option value="In-Person">In-Person</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="location" className="form-label">Location</label>
                        <input
                          type="text"
                          className="form-control"
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="duration" className="form-label">Duration</label>
                        <select
                          className="form-select"
                          id="duration"
                          name="duration"
                          value={formData.duration}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select duration...</option>
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="45">45 minutes</option>
                          <option value="60">1 hour</option>
                          <option value="90">1.5 hours</option>
                          <option value="120">2 hours</option>
                        </select>
                      </div>

                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-secondary btn-bubble"
                          onClick={() => setEditingMeeting(null)}
                        >
                          <i className="bi bi-x-circle me-1"></i>
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-bubble btn-update"
                          disabled={loading}
                        >
                          {loading ? 'Updating...' : <><i className="bi bi-check-circle me-1"></i> Update Meeting</>}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Type</th>
                          <th>Location</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {meetings.map(meeting => (
                          <tr key={meeting.id}>
                            <td>{meeting.title}</td>
                            <td>{meeting.date ? meeting.date.toLocaleDateString() : ''}</td>
                            <td>{meeting.reminderTime}</td>
                            <td>{meeting.type}</td>
                            <td>{meeting.location}</td>
                            <td>
                              {meeting.status !== 'completed' && (
                                <button
                                  className="btn btn-bubble btn-edit me-2"
                                  onClick={() => handleEdit(meeting)}
                                >
                                  <i className="bi bi-pencil me-1"></i>
                                  Edit
                                </button>
                              )}
                              <button
                                className="btn btn-bubble btn-delete"
                                onClick={() => handleDelete(meeting.id)}
                              >
                                <i className="bi bi-trash me-1"></i>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={`modal fade ${showDeleteModal ? 'show' : ''}`} style={{ display: showDeleteModal ? 'block' : 'none' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this meeting?</p>
                {meetingToDelete && (
                  <div className="alert alert-warning">
                    <strong>Meeting Details:</strong>
                    <ul className="mb-0">
                      <li>Title: {meetingToDelete.title}</li>
                      <li>Date: {meetingToDelete.date ? meetingToDelete.date.toLocaleDateString() : ''}</li>
                      <li>Time: {meetingToDelete.reminderTime}</li>
                      <li>Type: {meetingToDelete.type}</li>
                    </ul>
                  </div>
                )}
                <p className="text-danger">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={loading}>
                  {loading ? 'Deleting...' : 'Delete Meeting'}
                </button>
              </div>
            </div>
          </div>
        </div>
        {showDeleteModal && <div className="modal-backdrop fade show"></div>}

        <style jsx>{`
          .glassmorphic {
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            border: 1px solid rgba(255, 255, 255, 0.5);
          }
          .title {
            font-size: 2rem;
            font-weight: bold;
            color: #333;
          }
          .header-banner {
            background-color: #4A7C20; /* Dark green for the header banner */
            color: white;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            margin-bottom: 20px;
          }
          .btn-bubble {
            padding: 0.5rem 1rem;
            border-radius: 50px; /* Bubble style */
            font-weight: 500;
            border: none;
            transition: background-color 0.3s, color 0.3s;
          }
          .btn-edit {
            background-color: #007bff; /* Blue for edit */
            color: white;
          }
          .btn-delete {
            background-color: #dc3545; /* Red for delete */
            color: white;
          }
          .btn-update {
            background-color: #28a745; /* Green for update */
            color: white;
          }
          .btn-bubble:hover {
            opacity: 0.9; /* Slightly darker on hover */
          }
        `}</style>
      </div>
    </Layout>
  );
}