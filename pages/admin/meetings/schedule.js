'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout/Layout';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../dataconnect/firebase';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

export default function ScheduleMeeting() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'virtual',
    duration: 60,
    location: '',
    meetingLink: '',
    emailNotifications: true,
    pushNotifications: true,
    reminderTime: '08:00',
    reminderDays: 1
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMeetingDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('Admin not logged in.');
      }

      // Parse the date and time to create a proper Date object
      const [hours, minutes] = (meetingDetails.time || '09:00').split(':').map(Number); // Add fallback for time
      const meetingDate = new Date(meetingDetails.date);

      const startDate = new Date(
        meetingDate.getFullYear(),
        meetingDate.getMonth(),
        meetingDate.getDate(),
        hours,
        minutes,
        0,
        0
      );

      // Calculate the end time based on the duration
      const endDate = new Date(startDate);
      const durationMinutes = meetingDetails.duration || 60; // Default to 60 minutes
      endDate.setMinutes(endDate.getMinutes() + durationMinutes);

      const meetingData = {
        ...meetingDetails,
        start: startDate,
        end: endDate,
        createdAt: new Date(),
        userId: currentUser.uid, // ✅ Add admin UID
      };

      // Save the meeting to the "meetings" collection
      await addDoc(collection(db, 'meetings'), meetingData);

      setSuccess('Meeting scheduled successfully!');
      setMeetingDetails({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0], // Reset to today's date
        time: '09:00', // Reset to default time
        type: 'virtual',
        duration: 60,
        location: '',
        meetingLink: '',
        emailNotifications: true,
        pushNotifications: true,
        reminderTime: '08:00',
        reminderDays: 1,
      });
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      setError('Failed to schedule meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Schedule Meeting</h1>
          <button
            className="btn btn-outline-secondary"
            onClick={() => router.push('/admin/meetingmanagement')}
          >
            Back
          </button>
        </div>
        <div className="card rounded-4 shadow-sm" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card-header bg-success text-white p-4 rounded-top-4">
            <h2 className="mb-2">Create Meeting</h2>
            <p className="mb-0">Fill in the fields to schedule a new meeting.</p>
          </div>
          
          <div className="card-body p-4">
            {error && (
              <div className="alert alert-danger mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="alert alert-success mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleScheduleMeeting}>
              <div className="mb-4">
                <label className="form-label fw-medium">Meeting Title</label>
                <input
                  type="text"
                  className="form-control form-control-lg bg-light"
                  name="title"
                  value={meetingDetails.title}
                  onChange={handleChange}
                  placeholder="Enter meeting title"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-medium">Description</label>
                <textarea
                  className="form-control bg-light"
                  name="description"
                  value={meetingDetails.description}
                  onChange={handleChange}
                  placeholder="Enter meeting description"
                  rows="3"
                  required
                />
              </div>

              <div className="row mb-4">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="form-label fw-medium">Priority Level</label>
                  <select
                    className="form-select bg-light"
                    name="type"
                    value={meetingDetails.type}
                    onChange={handleChange}
                  >
                    <option value="virtual">Virtual Meeting</option>
                    <option value="in-person">In-Person Meeting</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Deadline Date</label>
                  <input
                    type="date"
                    className="form-control bg-light"
                    name="date"
                    value={meetingDetails.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="form-label fw-medium">Reminder Time</label>
                  <input
                    type="time"
                    className="form-control bg-light"
                    name="reminderTime"
                    value={meetingDetails.reminderTime}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Duration (Minutes)</label>
                  <input
                    type="number"
                    className="form-control bg-light"
                    name="duration"
                    value={meetingDetails.duration}
                    onChange={handleChange}
                    min="15"
                    step="15"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-medium">Notification Settings</label>
                <div className="d-flex gap-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="emailNotifications"
                      checked={meetingDetails.emailNotifications}
                      onChange={handleChange}
                      id="emailNotif"
                    />
                    <label className="form-check-label" htmlFor="emailNotif">
                      Email Notifications
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="pushNotifications"
                      checked={meetingDetails.pushNotifications}
                      onChange={handleChange}
                      id="pushNotif"
                    />
                    <label className="form-check-label" htmlFor="pushNotif">
                      Push Notifications
                    </label>
                  </div>
                </div>
              </div>

              {meetingDetails.type === 'virtual' ? (
                <div className="mb-4">
                  <label className="form-label fw-medium">Meeting Link</label>
                  <input
                    type="url"
                    className="form-control bg-light"
                    name="meetingLink"
                    value={meetingDetails.meetingLink}
                    onChange={handleChange}
                    placeholder="https://..."
                    required
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <label className="form-label fw-medium">Location</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    name="location"
                    value={meetingDetails.location}
                    onChange={handleChange}
                    placeholder="Enter meeting location"
                    required
                  />
                </div>
              )}

              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  ) : (
                    'Create Meeting'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .form-control, .form-select {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid #e0e0e0;
        }
        .form-control:focus, .form-select:focus {
          border-color: #28a745;
          box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
        }
        .btn-primary {
          background-color: #0d6efd;
          border: none;
          padding: 1rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }
        .btn-primary:hover {
          background-color: #0b5ed7;
          transform: translateY(-1px);
        }
        .form-check-input:checked {
          background-color: #28a745;
          border-color: #28a745;
        }
      `}</style>
    </Layout>
  );
}