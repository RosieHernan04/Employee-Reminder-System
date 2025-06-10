'use client';

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from 'components/MainLayout/Layout';
import { collection, query, orderBy, onSnapshot, where, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../dataconnect/firebase';
import MeetingStatus from '../../components/MeetingStatus';
import Link from 'next/link';

export default function MeetingManagement() {
  const router = useRouter();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [error, setError] = useState(null);

  // Calendar navigation functions
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatMonthYear = (date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    const today = new Date();
    
    const days = [];
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - i);
      const dayMeetings = meetings.filter(meeting => {
        const meetingDate = new Date(meeting.start);
        return meetingDate.getDate() === date.getDate() &&
               meetingDate.getMonth() === date.getMonth() &&
               meetingDate.getFullYear() === date.getFullYear();
      });
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isToday: false,
        meetings: dayMeetings
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const isToday = i === today.getDate() && 
                     currentDate.getMonth() === today.getMonth() && 
                     currentDate.getFullYear() === today.getFullYear();
      const dayMeetings = meetings.filter(meeting => {
        const meetingDate = new Date(meeting.start);
        return meetingDate.getDate() === date.getDate() &&
               meetingDate.getMonth() === date.getMonth() &&
               meetingDate.getFullYear() === date.getFullYear();
      });
      days.push({
        day: i,
        isCurrentMonth: true,
        isToday: isToday,
        meetings: dayMeetings
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // 6 rows × 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
      const dayMeetings = meetings.filter(meeting => {
        const meetingDate = new Date(meeting.start);
        return meetingDate.getDate() === date.getDate() &&
               meetingDate.getMonth() === date.getMonth() &&
               meetingDate.getFullYear() === date.getFullYear();
      });
      days.push({
        day: i,
        isCurrentMonth: false,
        isToday: false,
        meetings: dayMeetings
      });
    }
    
    return days;
  };

  // Navigation functions for Meetings
  const handleScheduleMeeting = () => router.push('/admin/meetings/schedule');
  const handleMeetingEditDelete = () => router.push('/admin/meetings/edit');
  const handleMeetingStatus = () => router.push('/admin/meetings/status');
  const handleMeetingReminders = () => router.push('/admin/meetings/reminders');
  const handleInviteEmployees = () => router.push('/admin/meetings/invite');

  // Navigation functions for Deadlines
  const handleDeadlineNotifications = () => router.push('/admin/deadlines/notifications');
  const handleTrackDeadlines = () => router.push('/admin/deadlines/track');

  // Navigation functions for Employee Notifications
  const handleEmailNotification = () => router.push('/admin/notifications/manage');
  const handlePushNotifications = () => router.push('/admin/notifications/manage');
  const handleReminderSettings = () => router.push('/admin/notifications/manage');

  // Fetch meetings from Firestore in real-time
  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const meetingsQuery = query(
        collection(db, 'meetings'),
        orderBy('start', 'asc') // Use 'start' for ordering
      );

      const unsubscribe = onSnapshot(meetingsQuery, 
        (snapshot) => {
          const meetingsData = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            meetingsData.push({
              id: doc.id,
              ...data,
              start: data.start?.toDate() || new Date(), // Use 'start' instead of 'datetime'
              end: data.end?.toDate() || new Date(),
            });
          });
          setMeetings(meetingsData);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching meetings:', error);
          setError('Error fetching meetings. Please try again.');
          setLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up meetings listener:', error);
      setError('Error setting up meetings listener. Please try again.');
      setLoading(false);
    }
  }, []);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge class
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

  async function scheduleMeeting(meetingData) {
    const { title, description, datetime, location, duration, type, status } = meetingData;

    // Save meeting to the "meetings" collection
    await addDoc(collection(db, 'meetings'), {
      title,
      description,
      datetime, // Ensure datetime is saved correctly
      location,
      duration,
      type,
      status,
      createdAt: new Date(),
    });
  }

  // Helper: Check if a date is in the selected month/year
  const isInSelectedMonth = (date) => {
    if (!date) return false;
    const d = new Date(date);
    return (
      d.getFullYear() === currentDate.getFullYear() &&
      d.getMonth() === currentDate.getMonth()
    );
  };

  // Helper: Check if a meeting is overdue (start before today and not completed)
  const isOverdue = (meeting) => {
    if (!meeting.start) return false;
    const start = new Date(meeting.start);
    const now = new Date();
    return start < now && meeting.status !== 'completed';
  };

  // Filter meetings: 
  // - Show all meetings for the selected month (regardless of status)
  // - Also show meetings not completed (regardless of date)
  const filteredMeetings = meetings.filter(meeting =>
    isInSelectedMonth(meeting.start) ||
    meeting.status !== 'completed'
  );

  return (
    <Layout>
      <div>
        {/* Enhanced Title Styling */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h1 className="display-4 fw-bold text-primary mb-0">
            Meeting Management
            <div className="title-underline bg-primary mt-2"></div>
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/admin/dashboard">Dashboard</Link>
            </li>
            <li className="breadcrumb-item active">Meeting Management</li>
          </ol>
        </nav>

        {/* Calendar Section */}
        <div className="row justify-content-center">
          <div className="col-xl-8">
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-brown text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0 text-white">Calendar</h5>
              </div>
              <div className="card-body calendar-container">
                <div className="calendar-header">
                  <button className="btn btn-outline-brown" onClick={prevMonth}>Prev</button>
                  <h2 className="calendar-title">{formatMonthYear(currentDate)}</h2>
                  <button className="btn btn-outline-brown" onClick={nextMonth}>Next</button>
                  <button className="btn btn-brown today-btn" onClick={goToToday}>Today</button>
                </div>
                <div className="calendar-grid">
                  <div className="calendar-weekdays">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="weekday">{day}</div>
                    ))}
                  </div>
                  <div className="calendar-days">
                    {generateCalendarDays().map((day, index) => (
                      <div
                        key={index}
                        className={`calendar-day ${day.isCurrentMonth ? 'current-month' : 'other-month'} ${day.isToday ? 'today' : ''}`}
                        title={day.meetings.length > 0 ? 
                          day.meetings.map(meeting => 
                            `${meeting.title} (${formatTime(meeting.start)})`
                          ).join('\n') : 
                          ''}
                      >
                        <div className="day-number">{day.day}</div>
                        {day.meetings.length > 0 && (
                          <div className="meeting-indicator">
                            <span className="badge bg-primary">
                              {day.meetings.length} meeting{day.meetings.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Management Cards */}
        <div className="row g-3 mb-4">
          {/* Manage Meetings Card */}
          <div className="col-md-4">
            <div className="card shadow-sm h-100 gradient-card-primary">
              <div className="card-header bg-transparent">
                <h5 className="mb-0">Meeting Management</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  <button onClick={handleScheduleMeeting} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <div className="icon-circle bg-primary text-white me-3">
                      <i className="bi bi-calendar-plus"></i>
                    </div>
                    <div className="d-flex flex-column">
                      <span className="fw-bold">Schedule Meeting</span>
                      <small className="text-muted">Create and schedule new meetings with details</small>
                    </div>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                  <button onClick={handleInviteEmployees} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <div className="icon-circle bg-blue text-white me-3">
                      <i className="bi bi-people-fill"></i>
                    </div>
                    <div className="d-flex flex-column">
                      <span className="fw-bold">Share Meeting</span>
                      <small className="text-muted">Share meeting details with employees</small>
                    </div>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                  <button onClick={handleMeetingEditDelete} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <div className="icon-circle bg-brown text-white me-3">
                      <i className="bi bi-pencil-square"></i>
                    </div>
                    <div className="d-flex flex-column">
                      <span className="fw-bold">Meeting Edit-Delete</span>
                      <small className="text-muted">Modify meeting details or remove scheduled meetings</small>
                    </div>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Manage Deadlines Card */}
          <div className="col-md-4">
            <div className="card shadow-sm h-100 gradient-card-secondary">
              <div className="card-header bg-transparent">
                <h5 className="mb-0">Manage Deadlines</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  <button onClick={handleDeadlineNotifications} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <div className="icon-circle bg-success text-white me-3">
                      <i className="bi bi-bell-fill"></i>
                    </div>
                    <div className="d-flex flex-column">
                      <span className="fw-bold">Deadline Alerts</span>
                      <small className="text-muted">Set up deadline reminder notifications</small>
                    </div>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                  <button onClick={handleTrackDeadlines} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <div className="icon-circle bg-info text-white me-3">
                      <i className="bi bi-kanban-fill"></i>
                    </div>
                    <div className="d-flex flex-column">
                      <span className="fw-bold">Track Progress</span>
                      <small className="text-muted">Monitor deadline completion status</small>
                    </div>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Notifications Card */}
          <div className="col-md-4">
            <div className="card shadow-sm h-100 gradient-card-tertiary">
              <div className="card-header bg-transparent">
                <h5 className="mb-0">Employee Notifications</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  <button onClick={handleEmailNotification} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <div className="icon-circle bg-primary text-white me-3">
                      <i className="bi bi-bell-fill"></i>
                    </div>
                    <div className="d-flex flex-column">
                      <span className="fw-bold">Notification Settings</span>
                      <small className="text-muted">Configure all notification preferences</small>
                    </div>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meetings List Section */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Scheduled Meetings</h5>
            <span className="badge bg-light text-primary">{filteredMeetings.length} meetings</span>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center p-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading meetings...</p>
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className="text-center p-4">
                <i className="bi bi-calendar-x text-muted" style={{ fontSize: '2rem' }}></i>
                <p className="mt-2">No meetings for this month</p>
                <button 
                  onClick={handleScheduleMeeting}
                  className="btn btn-primary mt-2"
                >
                  Schedule a Meeting
                </button>
              </div>
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
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMeetings.map((meeting) => (
                      <tr key={meeting.id} className={meeting.status === 'completed' ? 'table-success' : ''}>
                        <td>{meeting.title}</td>
                        <td>{formatDate(meeting.start)}</td>
                        <td>{meeting.reminderTime || 'Not set'}</td>
                        <td>{meeting.type}</td>
                        <td>{meeting.location}</td>
                        <td>{meeting.duration}</td>
                        <td>
                          <MeetingStatus 
                            meeting={meeting} 
                            isAdmin={true}
                            onStatusChange={(newStatus) => {
                              setMeetings(prevMeetings => 
                                prevMeetings.map(m => 
                                  m.id === meeting.id 
                                    ? { ...m, status: newStatus, completedAt: new Date() } 
                                    : m
                                )
                              );
                            }} 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-4 text-center text-muted">
          <p>© 2025 ADECMPC. All Rights Reserved.</p>
        </footer>
      </div>

      <style jsx>{`
        .title-underline {
          height: 4px;
          width: 100px;
          border-radius: 2px;
          background: linear-gradient(90deg, #ffc107, #28a745, #8b4513, #dc3545);
        }
        
        .action-button {
          transition: all 0.3s ease;
          border: none;
          background: transparent;
          text-align: left;
          position: relative;
          overflow: hidden;
        }
        
        .action-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }
        
        .action-button:hover::before {
          transform: translateX(0);
        }
        
        .action-button:hover {
          background-color: rgba(44, 62, 80, 0.05);
          transform: translateX(5px);
        }
        
        .card {
          border-radius: 10px;
          overflow: hidden;
          transition: all 0.3s ease;
          border: none;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }
        
        .card-header {
          padding: 15px 20px;
        }
        
        .list-group-item-action {
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .list-group-item-action:last-child {
          border-bottom: none;
        }

        .meeting-row {
          transition: all 0.2s ease;
        }

        .meeting-row:hover {
          background-color: rgba(0, 123, 255, 0.05);
        }

        .table th {
          font-weight: 600;
          border-top: none;
        }

        .btn-group .btn {
          padding: 0.25rem 0.5rem;
        }

        .icon-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .action-button:hover .icon-circle {
          transform: scale(1.1) rotate(5deg);
        }

        .gradient-card-primary {
          background: linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%);
          color: #2c3e50;
        }

        .gradient-card-secondary {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          color: #2c3e50;
        }

        .gradient-card-tertiary {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          color: #2c3e50;
        }

        .card-header h5 {
          color: #2c3e50;
          font-weight: 600;
        }

        .action-button {
          color: #2c3e50;
        }

        .action-button span {
          font-weight: 500;
        }

        /* Calendar Styles */
        .calendar-container {
          padding: 15px;
          background-color: #fff;
          background: linear-gradient(135deg, #f0f7f0 0%, #e8f5e8 100%);
        }

        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .calendar-title {
          margin: 0;
          color: #2e7d32;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .calendar-grid {
          width: 100%;
        }

        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 4px;
        }

        .weekday {
          text-align: center;
          padding: 8px;
          font-weight: bold;
          color: #2e7d32;
          background-color: #c8e6c9;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }

        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
          position: relative;
          min-height: 60px;
        }

        .day-number {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .meeting-indicator {
          font-size: 0.75rem;
          margin-top: auto;
        }

        .current-month {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        .other-month {
          background-color: #f1f8e9;
          color: #7cb342;
          opacity: 0.7;
        }

        .today {
          background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%) !important;
          color: white !important;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(46, 125, 50, 0.2);
        }

        .calendar-day:hover {
          background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
          color: white;
        }

        .btn {
          padding: 0.375rem 1rem;
          font-size: 0.9rem;
        }

        .btn-brown {
          background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
          color: white;
          border: none;
        }

        .btn-brown:hover {
          background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
          color: white;
        }

        .btn-outline-brown {
          color: #2e7d32;
          border-color: #2e7d32;
        }

        .btn-outline-brown:hover {
          background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
          color: white;
        }

        .today-btn {
          margin-left: 8px;
        }

        .bg-brown {
          background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
        }

        .alert {
          z-index: 1050;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .badge {
          font-size: 0.85rem;
          padding: 0.5em 0.7em;
        }

        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
      `}</style>
    </Layout>
  );
}