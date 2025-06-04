'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from 'lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import Layout from 'components/MainLayout/Layout';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Modal, Button, Form } from 'react-bootstrap';
import { CheckCircleIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';


const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Utility function to format reminderTime
const formatReminderTime = (timeStr) => {
  if (!timeStr) return 'N/A';
  const [hour, minute] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

// Utility function to get the correct meeting time
const getMeetingTime = (meeting) => {
  if (meeting.assignedBy?.uid === 'admin') {
    // Admin-assigned meetings: use reminderTime
    return meeting.reminderTime || 'N/A';
  } else {
    // Employee-created meetings: use time
    return meeting.time || 'N/A';
  }
};

// Utility function to format date and time
const formatDateTime = (start) => {
  if (!start) return 'N/A';
  const dateObj = new Date(start?.seconds ? start.seconds * 1000 : start);
  return `${dateObj.toLocaleDateString()} at ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

function MeetingCard({ meeting }) {
  return (
    <div className="meeting-card">
      <h3>{meeting.title}</h3>
      <p>Date: {new Date(meeting.datetime.seconds * 1000).toLocaleString()}</p>
      <p>Created by: {meeting.meetingId ? 'Employee' : 'Admin'}</p>
    </div>
  );
}

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [user, setUser] = useState(null);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: new Date(),
    time: '09:00',
    duration: '1 hour',
    type: 'Team Meeting',
    description: '',
    link: '',
    reminderDays: '', // Add reminderDays to state
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        router.push('/login');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);

    const adminQuery = query(
      collection(db, 'meetings'),
      where('assignedTo.uid', '==', user.uid) // ✅ Correct nested field match
    );

    const personalQuery = query(
      collection(db, 'employee_meetings'),
      where('userId', '==', user.uid)
    );

    const unsubscribeAdmin = onSnapshot(adminQuery, (snapshot) => {
      const adminMeetings = snapshot.docs.map(doc => {
        const data = doc.data();
        const startDate = data.start?.toDate?.() || new Date(); // Corrected to use `start` field
        const duration = Number(data.duration) || 60;
        const endDate = new Date(startDate.getTime() + duration * 60000);

        return {
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          start: startDate,
          end: endDate,
          location: data.location || '',
          type: data.type || 'admin',
          status: data.status || 'pending',
          reminderTime: data.reminderTime || '09:00', // ✅ Ensure reminderTime is included
          assignedBy: 'admin'
        };
      });

      setMeetings(prev => {
        const employeeOnly = prev.filter(m => m.assignedBy === 'employee');
        return [...employeeOnly, ...adminMeetings];
      });

      setLoading(false);
    });

    const unsubscribeEmployee = onSnapshot(personalQuery, (snapshot) => {
      const employeeMeetings = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          start: data.start?.toDate?.() || new Date(),
          end: data.end?.toDate?.() || new Date(),
          location: data.location || '',
          type: data.type || 'employee',
          status: data.status || 'scheduled',
          reminderTime: data.time || '09:00',
          assignedBy: 'employee'
        };
      });

      setMeetings(prev => {
        const adminOnly = prev.filter(m => m.assignedBy === 'admin');
        return [...adminOnly, ...employeeMeetings];
      });

      setLoading(false);
    });

    return () => {
      unsubscribeAdmin();
      unsubscribeEmployee();
    };
  }, [user?.uid]);

  const addMeeting = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const [hours, minutes] = newMeeting.time.split(':').map(Number);
      const meetingDate = new Date(newMeeting.date);
      const startDate = new Date(
        meetingDate.getFullYear(),
        meetingDate.getMonth(),
        meetingDate.getDate(),
        hours,
        minutes,
        0,
        0
      );

      const endDate = new Date(startDate);
      let durationHours = 1;
      let durationMinutes = 0;

      if (newMeeting.duration) {
        if (newMeeting.duration === '30 minutes') {
          durationMinutes = 30;
        } else if (newMeeting.duration === '1.5 hours') {
          durationHours = 1;
          durationMinutes = 30;
        } else {
          const match = newMeeting.duration.match(/(\d+)/);
          if (match) {
            durationHours = parseInt(match[1]);
          }
        }
      }

      endDate.setHours(startDate.getHours() + durationHours);
      endDate.setMinutes(startDate.getMinutes() + durationMinutes);

      const meetingsRef = collection(db, 'employee_meetings');
      const meetingData = {
        title: newMeeting.title,
        type: newMeeting.type,
        description: newMeeting.description,
        link: newMeeting.link,
        userId: user.uid,
        createdAt: new Date(),
        status: 'scheduled',
        date: startDate,
        time: format(startDate, 'HH:mm'),
        start: startDate,
        end: endDate,
        duration: newMeeting.duration,
        reminderDays: newMeeting.reminderDays ? Number(newMeeting.reminderDays) : 0 // Store reminderDays
      };
      await addDoc(meetingsRef, meetingData);
      setSuccess('Meeting scheduled successfully!');
      setShowMeetingForm(false);
      setNewMeeting({
        title: '',
        date: new Date(),
        time: '09:00',
        duration: '1 hour',
        type: 'Team Meeting',
        description: '',
        link: '',
        reminderDays: '', // Reset reminderDays
      });
    } catch (error) {
      console.error('Error adding meeting:', error);
      setError('Failed to schedule meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateMeeting = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const [hours, minutes] = newMeeting.time.split(':').map(Number);
      const startDate = new Date(newMeeting.date);
      startDate.setHours(hours, minutes, 0);

      const endDate = new Date(startDate);
      let durationHours = 1;
      let durationMinutes = 0;

      if (newMeeting.duration) {
        if (newMeeting.duration === '30 minutes') {
          durationMinutes = 30;
        } else if (newMeeting.duration === '1.5 hours') {
          durationHours = 1;
          durationMinutes = 30;
        } else {
          const match = newMeeting.duration.match(/(\d+)/);
          if (match) {
            durationHours = parseInt(match[1]);
          }
        }
      }

      endDate.setHours(startDate.getHours() + durationHours);
      endDate.setMinutes(startDate.getMinutes() + durationMinutes);

      const meetingRef = doc(db, 'employee_meetings', editingMeeting.id);
      await updateDoc(meetingRef, {
        title: newMeeting.title,
        type: newMeeting.type,
        description: newMeeting.description,
        link: newMeeting.link,
        updatedAt: new Date(),
        start: startDate,
        end: endDate,
        duration: newMeeting.duration,
        reminderDays: newMeeting.reminderDays ? Number(newMeeting.reminderDays) : 0 // Store reminderDays
      });
      
      setSuccess('Meeting updated successfully!');
      setShowMeetingForm(false);
      setEditingMeeting(null);
    } catch (error) {
      console.error('Error updating meeting:', error);
      setError('Failed to update meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeeting = (meetingId) => {
    setMeetingToDelete(meetingId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteMeeting = async () => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'employee_meetings', meetingToDelete));
      setSuccess('Meeting deleted successfully!');
    } catch (error) {
      console.error('Error deleting meeting:', error);
      setError('Failed to delete meeting. Please try again.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setMeetingToDelete(null);
    }
  };

  const handleEditMeeting = (meeting) => {
    setEditingMeeting(meeting);
    setNewMeeting(meeting);
    setShowMeetingForm(true);
  };

  const completeMeeting = async (meetingId) => {
    try {
      setLoading(true);
      const meetingRef = doc(db, 'employee_meetings', meetingId);
      await updateDoc(meetingRef, {
        status: 'completed',
        completedAt: Timestamp.now()
      });
      setSuccess('Meeting marked as completed!');
    } catch (error) {
      console.error('Error completing meeting:', error);
      setError('Failed to complete meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if a date is in the current month and year
  const isCurrentMonth = (date) => {
    if (!date) return false;
    const d = date instanceof Date ? date : (date?.seconds ? new Date(date.seconds * 1000) : new Date(date));
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  };

  // Filter meetings: show all incomplete meetings, and only completed meetings from the current month
  const filteredMeetings = meetings.filter(meeting =>
    meeting.status !== 'completed' || (meeting.status === 'completed' && isCurrentMonth(meeting.start))
  );

  const renderMeetingList = () => {
    return (
      <div className="mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 
            className="mb-0" 
            style={{ 
              color: "#2d8659", 
              fontWeight: "bold",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)"
            }}
          >
            My Meetings
          </h2>
        </div>
        <div 
          className="card" 
          style={{ 
            borderRadius: "15px",
            overflow: "hidden",
            background: "rgba(255, 255, 255, 0.25)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
          }}
        >
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date & Time</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeetings.map((meeting, index) => (
                    <tr key={meeting.id}>
                      <td>{meeting.title}</td>
                      <td>{formatDateTime(meeting.start)}</td>
                      <td>{meeting.type}</td>
                      <td>{meeting.location}</td>
                      <td>
                        <span className={`badge bg-${meeting.status === 'completed' ? 'success' : 'primary'}`}>
                          {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group" role="group" style={{ gap: '4px' }}>
                          {meeting.assignedBy !== 'admin' && ( // ✅ Hide buttons for admin-assigned meetings
                            <>
                              {meeting.status !== 'completed' && (
                                <button
                                  className="btn btn-success d-flex align-items-center"
                                  onClick={() => completeMeeting(meeting.id)}
                                  disabled={loading || meeting.status === 'completed'}
                                  title="Complete Meeting"
                                  style={{
                                    padding: '8px 12px',
                                    background: '#2d8659',
                                    border: 'none',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    backdropFilter: 'blur(10px)',
                                    minWidth: '100px',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <CheckCircleIcon className="h-5 w-5 me-1" />
                                  <span>Complete</span>
                                </button>
                              )}
                              <button
                                className="btn btn-primary d-flex align-items-center"
                                onClick={() => handleEditMeeting(meeting)}
                                disabled={loading || meeting.status === 'completed'}
                                title="Edit Meeting"
                                style={{
                                  padding: '8px 12px',
                                  background: '#0d6efd',
                                  border: 'none',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                  backdropFilter: 'blur(10px)',
                                  minWidth: '80px',
                                  justifyContent: 'center',
                                }}
                              >
                                <PencilIcon className="h-5 w-5 me-1" />
                                <span>Edit</span>
                              </button>
                              <button
                                className="btn btn-danger d-flex align-items-center"
                                onClick={() => handleDeleteMeeting(meeting.id)}
                                disabled={loading}
                                title="Delete Meeting"
                                style={{
                                  padding: '8px 12px',
                                  background: '#dc3545',
                                  border: 'none',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                  backdropFilter: 'blur(10px)',
                                  minWidth: '90px',
                                  justifyContent: 'center',
                                }}
                              >
                                <TrashIcon className="h-5 w-5 me-1" />
                                <span>Delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const formatCalendarEvents = () => {
    return meetings.map(meeting => {
      const startDate = meeting.start?.seconds
        ? new Date(meeting.start.seconds * 1000)
        : new Date(meeting.start);

      return {
        id: meeting.id,
        title: `${meeting.title} (${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`, // ✅ Fix time display
        start: startDate,
        end: meeting.end,
        allDay: false,
        resource: {
          type: meeting.type,
          status: meeting.status,
          assignedBy: meeting.assignedBy
        }
      };
    });
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#ff4d4d';
    let border = 'none';

    if (event.resource.status === 'completed') {
      backgroundColor = '#4CAF50';
    } else if (event.resource.type === 'admin') {
      backgroundColor = '#0d6efd';
    } else if (event.resource.type === 'employee') {
      backgroundColor = '#ffa726';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        border,
        display: 'block',
        height: '100%',
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold',
        lineHeight: '1.5',
      }
    };
  };

  const events = formatCalendarEvents();

  return (
    <Layout>
      <div className="container-fluid py-4 glass-bg">
        <div className="row">
          <div className="col-12">
            {/* Updated Title Style */}
            <div className="d-flex flex-column align-items-start mb-4">
              <h1
                className="employee-dashboard-title glass-title"
                style={{
                  fontWeight: 800,
                  fontSize: "2.5rem",
                  color: "#1677ff",
                  marginBottom: "0.25rem",
                  letterSpacing: "0.5px",
                  fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif"
                }}
              >
                Meeting Calendar
              </h1>
              <div
                style={{
                  width: "180px",
                  height: "4px",
                  borderRadius: "2px",
                  background: "linear-gradient(90deg, #f9d923 0%, #36e2a0 40%, #1fa2ff 70%, #ff5858 100%)",
                  marginTop: "2px"
                }}
              />
            </div>
            <div className="card shadow-sm glass-section glass-brown">
              <div className="card-body calendar-glass-green">
                <h4 className="mb-4 glass-title" style={{ color: "#2d8659", fontWeight: "bold" }}>Calendar</h4>
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 600, background: "transparent" }}
                  onSelectSlot={({ start }) => {
                    setSelectedDate(start);
                    setNewMeeting({ 
                      ...newMeeting, 
                      date: start,
                      time: format(start, 'HH:mm')
                    });
                    setShowMeetingForm(true);
                  }}
                  selectable
                  eventPropGetter={eventStyleGetter}
                  dayPropGetter={(date) => ({
                    style: {
                      backgroundColor: date.getDate() % 2 === 0 ? '#e0f7fa' : '#ffecb3'
                    }
                  })}
                  views={['month', 'week', 'day']}
                  defaultView="month"
                  step={30}
                  timeslots={2}
                  min={new Date(0, 0, 0, 8, 0, 0)}
                  max={new Date(0, 0, 0, 20, 0, 0)}
                  formats={{
                    timeGutterFormat: 'h:mm A',
                    eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                      `${localizer.format(start, 'h:mm A')} - ${localizer.format(end, 'h:mm A')}`,
                    dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
                      `${localizer.format(start, 'MMM DD')} - ${localizer.format(end, 'MMM DD, YYYY')}`
                  }}
                />
              </div>
            </div>
            <div className="d-flex justify-content-center mt-4">
              <Button
                variant="success"
                onClick={() => setShowMeetingForm(true)}
                style={{
                  background: 'linear-gradient(45deg, #2d8659, #1a5c3c)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  boxShadow: '0 4px 12px rgba(45, 134, 89, 0.3)',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Schedule New Meeting
              </Button>
            </div>
          </div>
        </div>
        <div className="glass-section glass-table-section mt-4">
          {renderMeetingList()}
        </div>
      </div>
      {/* Meeting Form Modal */}
      <Modal show={showMeetingForm} onHide={() => {
        setShowMeetingForm(false);
        setEditingMeeting(null);
        setNewMeeting({
          title: '',
          date: new Date(),
          time: '09:00',
          duration: '1 hour',
          type: 'Team Meeting',
          description: '',
          link: '',
          reminderDays: '', // Reset reminderDays
        });
      }} centered>
        <Modal.Header closeButton style={{
          background: 'linear-gradient(45deg, #ff4d4d, #ff1a1a)',
          borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '20px 20px 0 0'
        }}>
          <div className="d-flex align-items-center">
            <Image
              src="/487083768_557976863971305_3421396436649360911_n.jpg"
              alt="ADECMPC Logo"
              width={40}
              height={40}
              style={{
                borderRadius: '50%',
                marginRight: '15px',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
            />
            <Modal.Title style={{
              color: '#fff',
              fontWeight: '600',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)'
            }}>
              {editingMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '0 0 20px 20px',
          padding: '25px'
        }}>
          <Form onSubmit={editingMeeting ? updateMeeting : addMeeting}>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#333', fontWeight: '500' }}>Title</Form.Label>
              <Form.Control
                type="text"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                required
                placeholder="Enter meeting title"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '2px solid rgba(255, 77, 77, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 15px',
                  boxShadow: '0 2px 8px rgba(255, 77, 77, 0.1)'
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#333', fontWeight: '500' }}>Date</Form.Label>
              <Form.Control
                type="date"
                value={newMeeting.date instanceof Date ? format(newMeeting.date, 'yyyy-MM-dd') : format(new Date(newMeeting.date.seconds * 1000), 'yyyy-MM-dd')}
                onChange={(e) => setNewMeeting({ ...newMeeting, date: new Date(e.target.value) })}
                required
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '2px solid rgba(255, 77, 77, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 15px',
                  boxShadow: '0 2px 8px rgba(255, 77, 77, 0.1)'
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#333', fontWeight: '500' }}>Time</Form.Label>
              <Form.Control
                type="time"
                value={newMeeting.time}
                onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                required
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '2px solid rgba(255, 77, 77, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 15px',
                  boxShadow: '0 2px 8px rgba(255, 77, 77, 0.1)'
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#333', fontWeight: '500' }}>Duration</Form.Label>
              <Form.Select
                value={newMeeting.duration}
                onChange={(e) => setNewMeeting({ ...newMeeting, duration: e.target.value })}
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '2px solid rgba(255, 77, 77, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 15px',
                  boxShadow: '0 2px 8px rgba(255, 77, 77, 0.1)'
                }}
              >
                <option value="30 minutes">30 minutes</option>
                <option value="1 hour">1 hour</option>
                <option value="1.5 hours">1.5 hours</option>
                <option value="2 hours">2 hours</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#333', fontWeight: '500' }}>Type</Form.Label>
              <Form.Select
                value={newMeeting.type}
                onChange={(e) => setNewMeeting({ ...newMeeting, type: e.target.value })}
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '2px solid rgba(255, 77, 77, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 15px',
                  boxShadow: '0 2px 8px rgba(255, 77, 77, 0.1)'
                }}
              >
                <option value="Team Meeting">Team Meeting</option>
                <option value="One-on-One">One-on-One</option>
                <option value="Client Meeting">Client Meeting</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#333', fontWeight: '500' }}>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newMeeting.description}
                onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                placeholder="Enter meeting description"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '2px solid rgba(255, 77, 77, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 15px',
                  boxShadow: '0 2px 8px rgba(255, 77, 77, 0.1)'
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#333', fontWeight: '500' }}>Meeting Link</Form.Label>
              <Form.Control
                type="url"
                value={newMeeting.link || ''}
                onChange={(e) => setNewMeeting({ ...newMeeting, link: e.target.value })}
                placeholder="Enter meeting link (e.g., Zoom, Google Meet)"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '2px solid rgba(255, 77, 77, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 15px',
                  boxShadow: '0 2px 8px rgba(255, 77, 77, 0.1)'
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#333', fontWeight: '500' }}>Reminder Days (before meeting date)</Form.Label>
              <Form.Control
                type="number"
                min={0}
                placeholder="Enter number of days before meeting for reminder"
                value={newMeeting.reminderDays || ''}
                onChange={e => setNewMeeting({ ...newMeeting, reminderDays: e.target.value })}
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '2px solid rgba(255, 77, 77, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 15px',
                  boxShadow: '0 2px 8px rgba(255, 77, 77, 0.1)'
                }}
              />
            </Form.Group>
            <div className="d-flex justify-content-end mt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowMeetingForm(false);
                  setEditingMeeting(null);
                  setNewMeeting({
                    title: '',
                    date: new Date(),
                    time: '09:00',
                    duration: '1 hour',
                    type: 'Team Meeting',
                    description: '',
                    link: '',
                    reminderDays: '', // Reset reminderDays
                  });
                }}
                style={{
                  background: 'rgba(108, 117, 125, 0.7)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  marginRight: '10px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                type="submit"
                style={{
                  background: 'linear-gradient(45deg, #ff4d4d, #ff1a1a)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  boxShadow: '0 2px 8px rgba(255, 77, 77, 0.3)'
                }}
              >
                {editingMeeting ? 'Update Meeting' : 'Schedule Meeting'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this meeting?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteMeeting}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      <style jsx>{`
        .glass-bg {
          background: rgba(255,255,255,0.18);
          border-radius: 18px;
          box-shadow: 0 8px 32px 0 rgba(31,38,135,0.18);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 2rem;
        }
        /* Change the purple outer calendar container to a green palette gradient */
        .glass-section.glass-brown {
          background: linear-gradient(135deg, #b7e7a0 0%, #7ed957 40%, #4caf50 100%);
        }
        /* Calendar inner background (already green, keep as is or tweak if needed) */
        .calendar-glass-green {
          background: linear-gradient(135deg, #e0f9e6 0%, #a8e063 40%, #56ab2f 100%);
          border-radius: 16px;
          box-shadow: 0 2px 12px 0 rgba(40,167,69,0.10);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          padding: 2rem;
        }
        /* Calendar tile (day cell) backgrounds: alternate white and light green */
        :global(.rbc-month-row) .rbc-day-bg:nth-child(odd) {
          background: #ffffff !important;
        }
        :global(.rbc-month-row) .rbc-day-bg:nth-child(even) {
          background: #e6f9e6 !important;
        }
        :global(.rbc-day-bg.rbc-today) {
          background: #b2f2a5 !important;
          box-shadow: 0 0 0 2px #4caf50 inset;
        }
        .glass-section {
          background: rgba(255,255,255,0.18);
          border-radius: 16px;
          box-shadow: 0 2px 12px 0 rgba(31,38,135,0.10);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          padding: 2rem;
          margin-bottom: 2rem;
        }
        .glass-table-section {
          border: 1.5px solid rgba(139,69,19,0.18);
          background: linear-gradient(120deg, rgba(40,167,69,0.10) 0%, rgba(255,193,7,0.10) 40%, rgba(139,69,19,0.10) 100%);
        }
        .calendar-glass-green {
          background: linear-gradient(135deg, #e0f9e6 0%, #a8e063 40%, #56ab2f 100%);
          border-radius: 16px;
          box-shadow: 0 2px 12px 0 rgba(40,167,69,0.10);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          padding: 2rem;
        }
        .glass-title {
          text-shadow: 0 2px 8px rgba(31,38,135,0.12);
        }
        .table-hover > tbody > tr:hover {
          background: rgba(0,123,255,0.08) !important;
        }
        .table th {
          font-weight: 700;
          background: #003366;
          color: #fff;
          border-bottom: 2px solid #1677ff;
        }
        .table td {
          background: rgba(255,255,255,0.10);
          color: #222;
        }
        .badge.bg-danger {
          background: #dc3545 !important;
          color: #fff !important;
        }
        .badge.bg-warning {
          background: #ffc107 !important;
          color: #222 !important;
        }
        .badge.bg-success {
          background: #28a745 !important;
          color: #fff !important;
        }
        .badge.bg-info {
          background: #17a2b8 !important;
          color: #fff !important;
        }
        .badge.bg-primary {
          background: #007bff !important;
          color: #fff !important;
        }
        .badge.bg-secondary {
          background: #8b4513 !important;
          color: #fff !important;
        }
        .card {
          border: none;
          border-radius: 10px;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        }
        .card-header {
          border-radius: 10px 10px 0 0 !important;
          padding: 1rem;
        }
        .input-group-text {
          background-color: #f8f9fa;
          border-right: none;
        }
        .input-group .form-control {
          border-left: none;
        }
        .input-group .form-control:focus {
          border-color: #ced4da;
          box-shadow: none;
        }
        .btn {
          padding: 0.5rem 1rem;
          font-weight: 500;
        }
        .btn-primary {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
        .btn-primary:hover {
          background-color: #0b5ed7;
          border-color: #0a58ca;
        }
      `}</style>
    </Layout>
  );
}
