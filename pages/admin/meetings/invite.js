import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout/Layout';
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../../dataconnect/firebase';
import axios from 'axios';
import { format } from 'date-fns';

export default function InviteEmployees() {
  const router = useRouter();
  const [meetings, setMeetings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedMeetings, setSelectedMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchMeetings() {
      try {
        const meetingsQuery = query(
          collection(db, 'meetings'),
          orderBy('start', 'desc') // Use 'start' for ordering
        );
        const querySnapshot = await getDocs(meetingsQuery);
        const meetingsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          start: doc.data().start?.toDate() || new Date(), // Use 'start' instead of 'datetime'
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

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const employeesQuery = query(
          collection(db, 'users'),
          where('role', '==', 'employee')
        );
        const querySnapshot = await getDocs(employeesQuery);
        const employeesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        employeesData.sort((a, b) => a.fullName.localeCompare(b.fullName));
        setEmployees(employeesData);
        setFilteredEmployees(employeesData);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employees');
      }
    }

    fetchEmployees();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(employee =>
      employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const handleSelectMeeting = (meeting) => {
    setSelectedMeetings(prev =>
      prev.includes(meeting.id) ? prev.filter(id => id !== meeting.id) : [...prev, meeting.id]
    );
  };

  const handleSelectAllEmployees = () => {
    setSelectedEmployees(
      selectedEmployees.length === filteredEmployees.length ? [] : filteredEmployees.map(emp => emp.id)
    );
  };

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId) ? prev.filter(id => id !== employeeId) : [...prev, employeeId]
    );
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return { date: 'Not specified', time: 'Not specified' };
    try {
      const d = datetime instanceof Date ? datetime : new Date(datetime);
      if (isNaN(d.getTime())) return { date: 'Not specified', time: 'Not specified' };

      const formattedDate = d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const formattedTime = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      return { date: formattedDate, time: formattedTime };
    } catch (error) {
      console.error('Error formatting date:', error);
      return { date: 'Not specified', time: 'Not specified' };
    }
  };

  const formatDateForDisplay = (date, meeting) => {
    if (!date) return '';
    const displayTime = meeting.reminderTime || meeting.time;
    return `${format(date, 'MMM dd, yyyy')} ${displayTime || format(date, 'HH:mm')}`;
  };

  const assignMeeting = async (meetingData, selectedEmployee) => {
    try {
      const startTime = meetingData.start instanceof Date
        ? meetingData.start
        : new Date(meetingData.start?.seconds ? meetingData.start.seconds * 1000 : Date.now());

      const [hour, minute] = (meetingData.reminderTime || '09:00').split(':').map(Number);
      startTime.setHours(hour);
      startTime.setMinutes(minute);

      const endTime = new Date(startTime.getTime() + (Number(meetingData.duration) || 60) * 60000);

      await addDoc(collection(db, 'employee_meetings'), {
        ...meetingData,
        start: startTime,
        end: endTime,
        reminderTime: meetingData.reminderTime, // Keep only reminderTime for admin meetings
        userId: selectedEmployee.id,
        assignedBy: {
          uid: 'admin',
          name: 'Admin',
        },
        createdAt: serverTimestamp(),
        status: 'pending',
      });

      console.log(`Meeting assigned to ${selectedEmployee.fullName}`);
    } catch (error) {
      console.error('Error assigning meeting:', error);
    }
  };

  const inviteEmployeeToMeeting = async (meetingData, employeeId, employeeData) => {
    const adminMeetingsRef = collection(db, 'admin_meetings');

    const meetingDataWithReminderTime = {
      ...meetingData,
      assignedTo: {
        uid: employeeId,
        name: employeeData.fullName,
        email: employeeData.email
      },
      date: meetingData.date ? Timestamp.fromDate(new Date(meetingData.date)) : null,
      reminderTime: meetingData.reminderTime || '09:00', // Use reminderTime for admin meetings
      assignedAt: Timestamp.fromDate(new Date()),
      status: 'assigned',
      updatedAt: Timestamp.fromDate(new Date()),
    };

    await addDoc(adminMeetingsRef, meetingDataWithReminderTime);
  };

  const handleSendInvitations = async () => {
    if (selectedMeetings.length === 0) {
      setError('Please select at least one meeting to send invitations.');
      return;
    }

    if (selectedEmployees.length === 0) {
      setError('Please select at least one employee to send invitations.');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const selectedEmployeeObjects = employees.filter(emp => selectedEmployees.includes(emp.id));

      for (const meetingId of selectedMeetings) {
        const meeting = meetings.find(m => m.id === meetingId);

        if (!meeting) {
          throw new Error(`Meeting with ID ${meetingId} not found.`);
        }

        // Assign the meeting to each selected employee
        for (const employee of selectedEmployeeObjects) {
          await assignMeeting(meeting, employee);
        }

        // Send email invitations (existing functionality remains unchanged)
        const selectedEmployeeEmails = selectedEmployeeObjects.map(emp => emp.email);
        const payload = {
          meetingId,
          meetingTitle: meeting.title,
          meetingDate: meeting.start,
          reminderTime: meeting.reminderTime || '09:00', // ✅ Ensure reminderTime is included in the payload
          employeeEmails: selectedEmployeeEmails,
          description: meeting.description,
          priority: meeting.priority || 'Normal', // Default priority if not specified
          location: meeting.location,
          type: meeting.type,
          link: meeting.meetingLink,
        };

        console.log('Sending payload to API:', payload); // Debugging log
        const response = await axios.post('/api/meetings/invite', payload);

        if (response.status !== 200) {
          throw new Error(response.data.message || 'Failed to send invitations');
        }
      }

      setSuccess(true);
      setSelectedEmployees([]);
      setSelectedMeetings([]);
    } catch (error) {
      console.error('Error sending invitations:', error);
      setError(error.message || 'Failed to send invitations.');
    } finally {
      setSending(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const inviteData = {
        title: meeting.title,
        description: meeting.description,
        datetime: new Date(`${meeting.date}T${meeting.time}`), // Combine date and time
        duration: meeting.duration,
        type: meeting.type,
        location: meeting.location,
        link: meeting.meetingLink,
        assignedTo: employee.uid, // ✅ Required field to assign the meeting to the employee
        status: 'pending',
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'meetings'), inviteData);

      setSuccess('Meeting invitation sent successfully!');
      router.push('/admin/meetingmanagement');
    } catch (error) {
      console.error('Error sending invitation:', error);
      setError('Failed to send invitation.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="text-primary title">
              <i className="bi bi-envelope-fill me-2"></i>Send Meeting Invitations
            </h1>
            <button className="btn btn-outline-secondary" onClick={() => router.push('/admin/meetingmanagement')}>
              Back
            </button>
          </div>

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}

          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              Invitations sent successfully!
              <button type="button" className="btn-close" onClick={() => setSuccess(false)}></button>
            </div>
          )}

          <div className="row g-4">
            <div className="col-md-6">
              <div className="card shadow-sm" style={{ backgroundColor: '#e3f2fd', borderRadius: '10px' }}>
                <div className="card-header text-white" style={{ backgroundColor: '#2196f3', borderRadius: '10px 10px 0 0' }}>
                  <h5 className="mb-0">Select Meetings</h5>
                </div>
                <div className="card-body" style={{ padding: '20px' }}>
                  {meetings.length === 0 ? (
                    <div className="alert alert-info">
                      No meetings found. Please create a meeting first.
                    </div>
                  ) : (
                    <div className="row g-3">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Location</th>
                            <th>Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {meetings.map((meeting) => (
                            <tr key={meeting.id}>
                              <td>
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`meeting-${meeting.id}`}
                                    checked={selectedMeetings.includes(meeting.id)}
                                    onChange={() => handleSelectMeeting(meeting)}
                                  />
                                  <label className="form-check-label" htmlFor={`meeting-${meeting.id}`}>
                                    {meeting.title}
                                  </label>
                                </div>
                              </td>
                              <td>{formatDateForDisplay(meeting.start, meeting)}</td> {/* Use unified time logic */}
                              <td>{meeting.type}</td>
                              <td>{meeting.location}</td>
                              <td>{meeting.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card shadow-sm" style={{ backgroundColor: '#e8f5e9', borderRadius: '10px' }}>
                <div className="card-header text-white" style={{ backgroundColor: '#4caf50', borderRadius: '10px 10px 0 0' }}>
                  <h5 className="mb-0">Select Employees</h5>
                  <button
                    className="btn btn-outline-light btn-sm float-end"
                    onClick={handleSelectAllEmployees}
                  >
                    {selectedEmployees.length === filteredEmployees.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="card-body" style={{ padding: '20px' }}>
                  <div className="mb-3">
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  {filteredEmployees.length === 0 ? (
                    <p>No employees match your search.</p>
                  ) : (
                    <div className="row g-3">
                      {filteredEmployees.map(employee => (
                        <div key={employee.id} className="col-12">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`employee-${employee.id}`}
                              checked={selectedEmployees.includes(employee.id)}
                              onChange={() => handleEmployeeSelect(employee.id)}
                            />
                            <label className="form-check-label" htmlFor={`employee-${employee.id}`}>
                              {employee.fullName} - <small className="text-muted">{employee.email}</small>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="text-end mt-4">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSendInvitations}
              disabled={sending || selectedMeetings.length === 0 || selectedEmployees.length === 0}
              style={{ borderRadius: '10px' }}
            >
              {sending ? 'Sending...' : 'Send Invitations'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
