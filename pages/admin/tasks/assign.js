'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from 'components/MainLayout/Layout';
import { db } from '../../../lib/firebase.ts';
import { collection, query, where, getDocs, doc, orderBy, deleteDoc } from 'firebase/firestore';
import { assignTaskToEmployee } from '../../../utils/taskAssignment';
import { useUser } from '../../../dataconnect/context/UserContext';

export default function AssignTask() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAllTasks, setSelectAllTasks] = useState(false);
  const [selectAllEmployees, setSelectAllEmployees] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchUnassignedTasks();
  }, []);

  const fetchUnassignedTasks = async () => {
    setLoading(true);
    try {
      console.log('Fetching unassigned tasks...');
      const unassignedTasksRef = collection(db, 'unassigned_tasks');
      
      const unassignedTasksQuery = query(
        unassignedTasksRef,
        orderBy('createdAt', 'desc')
      );

      const unassignedTasksSnapshot = await getDocs(unassignedTasksQuery);

      console.log('Query completed successfully');
      console.log(`Unassigned tasks count: ${unassignedTasksSnapshot.size}`);

      const tasksList = unassignedTasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        source: 'unassigned_tasks'
      }));

      console.log(`Total tasks found: ${tasksList.length}`);
      setTasks(tasksList);
      
      if (tasksList.length === 0) {
        setError('No unassigned tasks available.');
      } else {
        setError('');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(`Error fetching tasks: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      console.log('Fetching employees...');
      const usersRef = collection(db, 'users');
      const employeeQuery = query(
        usersRef,
        where('role', '==', 'employee')
      );

      const querySnapshot = await getDocs(employeeQuery);
      
      if (querySnapshot.empty) {
        console.log('No employees found');
        setEmployees([]);
        return;
      }

      const employeesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(emp => emp.fullName && emp.email);

      employeesList.sort((a, b) => a.fullName.localeCompare(b.fullName));
      setEmployees(employeesList);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Error fetching employees. Please try again.');
    }
  };

  const handleEmployeeSelection = (employeeId) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handleTaskSelection = (taskId) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    if (date instanceof Date) {
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSelectAllTasks = () => {
    if (selectAllTasks) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map(task => task.id));
    }
    setSelectAllTasks(!selectAllTasks);
  };

  const handleSelectAllEmployees = () => {
    if (selectAllEmployees) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.id));
    }
    setSelectAllEmployees(!selectAllEmployees);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (selectedTasks.length === 0 || selectedEmployees.length === 0) {
      setError('Please select at least one task and one employee.');
      setLoading(false);
      return;
    }

    try {
      const assignedBy = {
        uid: user?.uid,
        name: user?.displayName || user?.email
      };

      const assignmentPromises = [];
      const emailPromises = [];

      // Assign each selected task to each selected employee
      for (const employeeId of selectedEmployees) {
        const employee = employees.find(emp => emp.id === employeeId);
        if (!employee) continue;

        for (const taskId of selectedTasks) {
          const task = tasks.find(t => t.id === taskId);
          if (!task) continue;

          // Assign the task with employee data
          assignmentPromises.push(
            assignTaskToEmployee(taskId, employeeId, {
              fullName: employee.fullName,
              email: employee.email
            })
              .then(async ({ newTaskId }) => {
                // Send email notification
                return fetch('/api/tasks/send-email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    to: employee.email,
                    subject: `New Task Assignment: ${task.title}`,
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #0d6efd;">New Task Assignment</h2>
                        <p>Hello ${employee.fullName},</p>
                        <p>You have been assigned a new task:</p>
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                          <p><strong>Title:</strong> ${task.title}</p>
                          <p><strong>Description:</strong> ${task.description}</p>
                          <p><strong>Priority:</strong> ${task.priority}</p>
                          <p><strong>Deadline:</strong> ${task.deadline ? formatDate(task.deadline.toDate()) : 'No deadline specified'}</p>
                        </div>
                        <p>Please log in to your dashboard to view the task details and start working on it.</p>
                        <p><strong>Reminder:</strong> You will receive a reminder 30 minutes before the task deadline.</p>
                        <p>Best regards,<br>${assignedBy.name}</p>
                      </div>
                    `
                  })
                });
              })
              .catch(error => {
                console.error(`Error assigning task ${taskId} to employee ${employeeId}:`, error);
                throw error;
              })
          );
        }
      }

      // Wait for all assignments and emails to complete
      await Promise.all(assignmentPromises);

      // Delete the original tasks from unassigned_tasks after successful assignment
      for (const taskId of selectedTasks) {
        await deleteDoc(doc(db, 'unassigned_tasks', taskId));
      }

      setSuccess(`Successfully assigned ${selectedTasks.length} task(s) to ${selectedEmployees.length} employee(s).`);
      setSelectedTasks([]);
      setSelectedEmployees([]);
      fetchUnassignedTasks();
    } catch (error) {
      console.error('Error assigning tasks:', error);
      setError(`Error assigning tasks: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee => 
    employee.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-primary">Assign Tasks</h1>
          <button
            onClick={() => router.push('/admin/usermanagement')}
            className="btn btn-outline-primary"
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back
          </button>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card shadow-sm" style={{ backgroundColor: '#f8f4e3' }}>
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Assign Tasks to Employees</h5>
              </div>
              <div className="card-body" style={{ backgroundColor: '#d4edda' }}>
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {success}
                    <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="alert alert-info">
                    No unassigned tasks available.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {/* Task Selection */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <label className="form-label mb-0">Select Tasks to Assign</label>
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="selectAllTasks"
                            checked={selectAllTasks}
                            onChange={handleSelectAllTasks}
                          />
                          <label className="form-check-label" htmlFor="selectAllTasks">
                            Select All Tasks
                          </label>
                        </div>
                      </div>
                      <div className="list-group task-list">
                        {tasks.map(task => (
                          <label key={task.id} className="list-group-item">
                            <div className="d-flex align-items-center">
                              <input
                                type="checkbox"
                                className="form-check-input me-3"
                                checked={selectedTasks.includes(task.id)}
                                onChange={() => handleTaskSelection(task.id)}
                              />
                              <div className="task-info">
                                <div className="task-title">{task.title}</div>
                                <div className="task-details">
                                  <span className="text-muted">Created: {formatDate(task.createdAt)}</span>
                                  <span className="badge bg-primary ms-2">{task.priority}</span>
                                </div>
                                {task.description && (
                                  <div className="task-description mt-2">
                                    {task.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Employee Selection */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <label className="form-label mb-0">Assign to Employees</label>
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="selectAllEmployees"
                            checked={selectAllEmployees}
                            onChange={handleSelectAllEmployees}
                          />
                          <label className="form-check-label" htmlFor="selectAllEmployees">
                            Select All Employees
                          </label>
                        </div>
                      </div>
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search employees..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="list-group employee-list">
                        {filteredEmployees.map(employee => (
                          <label key={employee.id} className="list-group-item">
                            <div className="d-flex align-items-center">
                              <input
                                type="checkbox"
                                className="form-check-input me-3"
                                checked={selectedEmployees.includes(employee.id)}
                                onChange={() => handleEmployeeSelection(employee.id)}
                              />
                              <div className="employee-info">
                                <div className="employee-name">{employee.fullName}</div>
                                <div className="employee-details">
                                  <span className="text-muted">{employee.email}</span>
                                  {employee.username && (
                                    <span className="text-muted ms-2">(@{employee.username})</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <button
                        type="button"
                        className="btn btn-secondary me-2"
                        onClick={() => router.push('/admin/usermanagement')}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || selectedTasks.length === 0 || selectedEmployees.length === 0}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Assigning...
                          </>
                        ) : (
                          'Assign Tasks'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .task-list, .employee-list {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #dee2e6;
          border-radius: 0.375rem;
        }
        .list-group-item {
          cursor: pointer;
          transition: background-color 0.2s;
          border-left: none;
          border-right: none;
        }
        .list-group-item:first-child {
          border-top: none;
        }
        .list-group-item:last-child {
          border-bottom: none;
        }
        .list-group-item:hover {
          background-color: #f8f9fa;
        }
        .task-info, .employee-info {
          flex: 1;
        }
        .task-title, .employee-name {
          font-weight: 500;
          color: #212529;
        }
        .task-details, .employee-details {
          font-size: 0.875rem;
          color: #6c757d;
        }
        .task-description {
          font-size: 0.875rem;
          color: #495057;
          margin-top: 0.5rem;
        }
        .form-check-input {
          cursor: pointer;
        }
        .badge {
          font-weight: 500;
          text-transform: capitalize;
        }
      `}</style>
    </Layout>
  );
} 