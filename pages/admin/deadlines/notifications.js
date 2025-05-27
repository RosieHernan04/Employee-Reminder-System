'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout/Layout'
import { db } from '../../../lib/firebase.ts';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { formatDate, formatDateWithoutTime } from '../../../lib/utils/dateFormatter';

export default function Notifications() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pendingItems, setPendingItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [message, setMessage] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPendingItems();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'employee'));
      const querySnapshot = await getDocs(q);
      const employeesList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          fullName: data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          department: data.department || 'Operation Management'
        };
      });
      console.log('Fetched employees:', employeesList); // Debug log
      setEmployees(employeesList);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const name = employee.fullName || '';
    const email = employee.email || '';
    const search = searchTerm.toLowerCase();
    return name.toLowerCase().includes(search) || email.toLowerCase().includes(search);
  });

  const fetchPendingItems = async () => {
    try {
      console.log('Starting to fetch pending items...');

      // Fetch unique employee tasks
      console.log('Fetching employee tasks...');
      const tasksQuery = query(
        collection(db, 'employee_tasks'),
        where('status', '!=', 'completed')
      );

      let tasks = [];
      try {
        const tasksSnapshot = await getDocs(tasksQuery);
        console.log(`Found ${tasksSnapshot.size} employee tasks`);
        const taskMap = new Map(); // Use a Map to group tasks by unique fields
        tasksSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const uniqueKey = `${data.title}-${data.description}-${data.deadline || data.dueDate}-${data.priority}`;
          if (!taskMap.has(uniqueKey)) {
            taskMap.set(uniqueKey, {
              id: doc.id,
              collection: 'employee_tasks',
              type: 'Task',
              ...data,
              dueDate: data.deadline || data.dueDate, // Try deadline first, then fall back to dueDate
              dateTime: data.deadline || data.dueDate, // Include date and time
            });
          }
        });
        tasks = Array.from(taskMap.values());
      } catch (tasksError) {
        console.error('Error fetching employee tasks:', tasksError);
      }

      // Fetch meetings
      console.log('Fetching meetings...');
      const meetingsQuery = query(collection(db, 'meetings')); // Fetch all meetings

      let meetings = [];
      try {
        const meetingsSnapshot = await getDocs(meetingsQuery);
        console.log(`Found ${meetingsSnapshot.size} meetings`);
        meetings = meetingsSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Meeting data:', data); // Debug log
          return {
            id: doc.id,
            collection: 'meetings',
            type: 'Meeting',
            meetingType: data.type,
            ...data,
            dueDate: data.start?.toDate?.() || new Date(data.start), // Use the start timestamp for sorting
            dateTime: data.start?.toDate?.() || new Date(data.start), // Include date and time
          };
        });
      } catch (meetingsError) {
        console.error('Error fetching meetings:', meetingsError);
      }

      // Combine and sort all items
      const allItems = [...tasks, ...meetings];
      console.log('All items before sorting:', allItems); // Debug log

      allItems.sort((a, b) => {
        const dateA = a.dueDate?.toDate?.() || new Date(a.dueDate);
        const dateB = b.dueDate?.toDate?.() || new Date(b.dueDate);
        return dateA - dateB;
      });

      console.log('Total pending items:', allItems.length);
      setPendingItems(allItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      alert('Error fetching items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendEmailNotification = async (recipientEmail, subject, htmlContent) => {
    try {
      const response = await fetch('/api/tasks/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          subject,
          html: htmlContent,
        }),
      });

      const responseData = await response.json(); // Parse the response data

      if (!response.ok) {
        console.error(`Email API Error:`, responseData); // Log the error response
        throw new Error(responseData.message || 'Failed to send email. Please try again.');
      }

      console.log(`Email sent successfully to ${recipientEmail}:`, responseData); // Log success response
    } catch (error) {
      console.error(`Error sending email to ${recipientEmail}:`, error);
      throw error;
    }
  };

  const handleSendReminders = async () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item to send reminders for.');
      return;
    }

    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee to notify.');
      return;
    }

    if (!message.trim()) {
      alert('Please enter a reminder message.');
      return;
    }

    setLoading(true);
    try {
      const selectedItemsData = pendingItems.filter(item => selectedItems.includes(item.id));
      const selectedEmployeesData = employees.filter(emp => selectedEmployees.includes(emp.id));

      for (const employee of selectedEmployeesData) {
        try {
          const itemsDetails = selectedItemsData.map(item => {
            if (item.collection === 'meetings') {
              return `
                <li>
                  <strong>Meeting:</strong> ${item.title}<br>
                  <strong>Date and Time:</strong> ${formatDate(item.dateTime)}<br>
                  <strong>Priority:</strong> ${item.type === 'virtual' ? 'Virtual Meeting' : 'In-Person Meeting'}<br>
                  ${item.type === 'virtual' ? `
                    <strong>Meeting Link:</strong> ${item.meetingLink || 'Link will be provided later'}<br>
                  ` : `
                    <strong>Location:</strong> ${item.location || 'Not specified'}<br>
                  `}
                  <strong>Description:</strong> ${item.description || 'No description provided'}
                </li>
              `;
            } else {
              return `
                <li>
                  <strong>Task:</strong> ${item.title}<br>
                  <strong>Date and Time:</strong> ${formatDate(item.dateTime)}<br>
                  <strong>Priority:</strong> ${item.priority || 'Not specified'}<br>
                  <strong>Description:</strong> ${item.description || 'No description provided'}
                </li>
              `;
            }
          }).join('');

          const emailData = {
            to: employee.email,
            subject: 'Task/Meeting Reminder',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">Task/Meeting Reminder</h2>
                <p style="font-size: 16px; line-height: 1.5;">${message}</p>
                
                <h3 style="color: #2c3e50; margin-top: 20px;">Pending Items:</h3>
                <ul style="list-style-type: none; padding: 0;">
                  ${itemsDetails}
                </ul>
                
                <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
                  <p style="margin: 0;">Please complete these tasks/attend these meetings as soon as possible.</p>
                </div>
                
                <p style="margin-top: 20px; font-size: 14px; color: #666;">
                  This is an automated reminder. Please do not reply to this email.
                </p>
              </div>
            `
          };

          await sendEmailNotification(emailData.to, emailData.subject, emailData.html);
          console.log(`Email sent to ${employee.email}`);
        } catch (error) {
          console.error(`Error sending email to ${employee.email}:`, error);
          alert(`Failed to send email to ${employee.email}. Please try again.`);
        }
      }

      alert('Reminders sent successfully!');
      setSelectedItems([]);
      setSelectedEmployees([]);
      setMessage('');
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-primary">
            <i className="bi bi-bell-fill me-2"></i>
            Send Reminders
          </h1>
          <button
            className="btn btn-outline-primary"
            onClick={() => router.push('/admin/meetingmanagement')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back
          </button>
        </div>

        <div className="row">
          {/* Pending Items Section */}
          <div className="col-lg-8 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-list-check me-2"></i>
                  Pending Items
                </h5>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted mt-3">Loading pending items...</p>
                  </div>
                ) : pendingItems.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-check-circle text-success" style={{ fontSize: '3rem' }}></i>
                    <p className="text-muted mt-3">No pending items found.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedItems(pendingItems.map(item => item.id));
                                } else {
                                  setSelectedItems([]);
                                }
                              }}
                              checked={selectedItems.length === pendingItems.length}
                            />
                          </th>
                          <th>Type</th>
                          <th>Title</th>
                          <th>Due Date</th>
                          <th>Priority</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingItems.map((item) => {
                          console.log('Rendering item:', item); // Debug log
                          return (
                          <tr key={`${item.collection}-${item.id}`}>
                            <td>
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selectedItems.includes(item.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItems([...selectedItems, item.id]);
                                  } else {
                                    setSelectedItems(selectedItems.filter(id => id !== item.id));
                                  }
                                }}
                              />
                            </td>
                            <td>
                              <span className={`badge bg-${item.type === 'Meeting' ? 'info' : 'warning'}`}>
                                {item.type}
                              </span>
                            </td>
                            <td>{item.title}</td>
                            <td>
                              {formatDate(item.dateTime)} {/* Display date and time */}
                            </td>
                            <td>
                              <span className={`badge bg-${item.priority === 'high' ? 'danger' : item.priority === 'medium' ? 'warning' : 'info'}`}>
                                {item.priority || 'Not set'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge bg-${item.status === 'completed' ? 'success' : 'warning'}`}>
                                {item.status || 'pending'}
                              </span>
                            </td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Employee Selection Section */}
          <div className="col-lg-4 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-people-fill me-2"></i>
                  Select Employees
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text">
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
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEmployees(filteredEmployees.map(emp => emp.id));
                              } else {
                                setSelectedEmployees([]);
                              }
                            }}
                            checked={selectedEmployees.length === filteredEmployees.length}
                          />
                        </th>
                        <th>Name</th>
                        <th>Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map(employee => (
                        <tr key={employee.id}>
                          <td>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedEmployees.includes(employee.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEmployees([...selectedEmployees, employee.id]);
                                } else {
                                  setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id));
                                }
                              }}
                            />
                          </td>
                          <td>
                            <div className="d-flex flex-column">
                              <span className="fw-bold">{employee.fullName}</span>
                              <small className="text-muted">{employee.email}</small>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark">
                              {employee.department}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reminder Message Section */}
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-chat-dots-fill me-2"></i>
              Reminder Message
            </h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Message</label>
              <textarea
                className="form-control"
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your reminder message here..."
              />
            </div>
            <div className="d-flex justify-content-end">
              <button
                className="btn btn-primary"
                onClick={handleSendReminders}
                disabled={loading || selectedItems.length === 0 || selectedEmployees.length === 0}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-fill me-2"></i>
                    Send Reminders
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          border: none;
          border-radius: 10px;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        }
        .card-header {
          border-radius: 10px 10px 0 0 !important;
          padding: 1rem;
        }
        .table th {
          font-weight: 600;
          background-color: #f8f9fa;
          padding: 1rem;
        }
        .table td {
          padding: 1rem;
        }
        .badge {
          font-weight: 500;
          padding: 0.5em 0.7em;
        }
        .form-check-input {
          cursor: pointer;
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