"use client";

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from 'components/MainLayout/Layout';
import { collection, query, orderBy, getDocs, onSnapshot, where, collectionGroup, doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../dataconnect/firebase';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import Link from 'next/link';

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

const fetchAllEmployeeTasks = async () => {
  try {
    const [unassignedSnap, assignedSnap] = await Promise.all([
      getDocs(collection(db, 'unassigned_tasks')),
      getDocs(collection(db, 'employee_tasks')),
    ]);

    const unassignedTasks = unassignedSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      source: 'unassigned',
      createdAt: doc.data().createdAt?.toDate?.() || null,
      deadline: doc.data().deadline?.toDate?.() || null,
    }));

    const assignedTasks = assignedSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      source: 'assigned',
      createdAt: doc.data().createdAt?.toDate?.() || null,
      deadline: doc.data().deadline?.toDate?.() || null,
    }));

    return [...unassignedTasks, ...assignedTasks];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

export default function TaskManagement() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [adminTasks, setAdminTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeTasks, setEmployeeTasks] = useState([]); // Ensure it's initialized as an empty array
  const [unassignedTasks, setUnassignedTasks] = useState([]);

  // Calendar navigation functions
  const prevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
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

  // Helper function to safely convert to Date object
  const toDateObject = (date) => {
    if (!date) return null;
    if (date instanceof Date) return date;
    if (typeof date === 'object' && typeof date.toDate === 'function') return date.toDate();
    return new Date(date);
  };

  const formatCalendarEvents = () => {
    const employeeTaskEvents = tasks.map(task => {
      const startDate = toDateObject(task.deadline || task.dueDate);
      if (!startDate) return null;

      // Use assignedEmployees array for names
      const assignedToNames = (task.assignedEmployees && Array.isArray(task.assignedEmployees))
        ? task.assignedEmployees.map(emp => emp.fullName).filter(Boolean)
        : [];

      return {
        id: task.id,
        title: `${task.title} - Assigned to: ${assignedToNames.length > 0 ? assignedToNames.join(', ') : 'Unassigned'}`,
        start: startDate,
        end: startDate,
        allDay: false,
        resource: task,
        type: 'employee',
        status: task.status
      };
    }).filter(event => event !== null);

    const adminTaskEvents = adminTasks.map(task => {
      const startDate = toDateObject(task.deadline);
      if (!startDate) return null;

      return {
        id: task.id,
        title: task.title,
        start: startDate,
        end: startDate,
        allDay: false,
        resource: task,
        type: 'admin',
        status: task.status
      };
    }).filter(event => event !== null);

    return [...employeeTaskEvents, ...adminTaskEvents];
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const prevMonthDays = getDaysInMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1));
    const events = formatCalendarEvents();
    
    const days = [];
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, prevMonthDays - i);
      const dayTasks = events.filter(event => {
        if (!event.start) return false;
        return (
          event.start.getDate() === dayDate.getDate() &&
          event.start.getMonth() === dayDate.getMonth() &&
          event.start.getFullYear() === dayDate.getFullYear()
        );
      });
      
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isToday: false,
        tasks: dayTasks
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = i === today.getDate() && 
                     selectedDate.getMonth() === today.getMonth() && 
                     selectedDate.getFullYear() === today.getFullYear();
      
      const dayDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i);
      const dayTasks = events.filter(event => {
        if (!event.start) return false;
        return (
          event.start.getDate() === dayDate.getDate() &&
          event.start.getMonth() === dayDate.getMonth() &&
          event.start.getFullYear() === dayDate.getFullYear()
        );
      });
      
      days.push({
        day: i,
        isCurrentMonth: true,
        isToday: isToday,
        tasks: dayTasks
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // 6 rows × 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      const dayDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, i);
      const dayTasks = events.filter(event => {
        if (!event.start) return false;
        return (
          event.start.getDate() === dayDate.getDate() &&
          event.start.getMonth() === dayDate.getMonth() &&
          event.start.getFullYear() === dayDate.getFullYear()
        );
      });
      
      days.push({
        day: i,
        isCurrentMonth: false,
        isToday: false,
        tasks: dayTasks
      });
    }
    
    return days;
  };

  // Navigation functions for Tasks
  const handleCreateTask = () => router.push('/admin/tasks/create');
  const navigateToAssignTask = () => router.push('/admin/tasks/assign');
  const handleEditDeleteTasks = () => router.push('/admin/tasks/edit-delete');
  const handleTaskStatus = () => router.push('/admin/tasks/status');
  
  // Additional task management functions
  const handleAdminTasks = () => router.push('/admin/tasks/admin-tasks');
  const handleTaskTemplates = () => router.push('/admin/tasks/templates');
  const handleTaskCategories = () => router.push('/admin/tasks/categories');
  const handleTaskReports = () => router.push('/admin/tasks/reports');

  // First, add the navigation functions
  const handleCreateAdminTask = () => {
    router.push('/admin/tasks/admin/create');
  };

  const handleEditDeleteAdminTasks = () => {
    router.push('/admin/tasks/admin/edit-delete');
  };

  const handleAdminTaskStatus = () => {
    router.push('/admin/tasks/admin/status');
  };

  // Function to create a new task
  async function createTask(taskDetails) {
    try {
      // Generate a unique document ID for the new task
      const taskRef = doc(collection(db, 'unassigned_tasks'));

      // Save the task to Firestore
      await setDoc(taskRef, {
        ...taskDetails,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'unassigned',
      });

      console.log('✅ Task successfully created and stored in unassigned_tasks.');
    } catch (error) {
      console.error('❌ Error creating task:', error);
    }
  }

  // Real-time listener for unassigned tasks
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'unassigned_tasks'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const updatedUnassignedTasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || null,
        }));
        setUnassignedTasks(updatedUnassignedTasks);
      },
      (error) => {
        console.error('❌ Error fetching unassigned tasks in real-time:', error);
      }
    );

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

  // Function to assign a task to one or more employees
  async function assignTaskToEmployees(task, employees) {
    try {
      for (const employee of employees) {
        // 🔐 IMPORTANT: Always create a new document for each task assignment
        const taskRef = doc(collection(db, 'employee_tasks')); // ✅ Always a new document

        await setDoc(taskRef, {
          title: task.title,
          description: task.description,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          assignedAt: serverTimestamp(),
          deadline: task.deadline,
          createdBy: task.createdBy,
          assignedTo: {
            uid: employee.uid,
            name: employee.name,
            email: employee.email,
          },
          notifications: task.notifications,
          priority: task.priority,
          status: 'assigned',
          progress: 0,
          statusNotes: '',
          type: 'employee',
        });

        console.log(`✅ Task assigned to ${employee.name} (doc: ${taskRef.id})`);
      }

      // Delete the unassigned task
      if (task.id) {
        await deleteDoc(doc(db, 'unassigned_tasks', task.id));
      }

      console.log('✅ Task assigned to all employees correctly.');
    } catch (error) {
      console.error('❌ Error assigning tasks:', error);
      throw error;
    }
  }

  // Example usage of the function
  async function handleAssignTask(taskId, employeeIds) {
    const task = unassignedTasks.find(t => t.id === taskId);
    if (!task) {
      console.error('Task not found in unassigned tasks.');
      return;
    }

    const employees = employeeIds.map(employeeId => {
      const employee = employees.find(emp => emp.id === employeeId);
      return {
        uid: employee.id,
        name: employee.name,
        email: employee.email,
      };
    });

    await assignTaskToEmployees(task, employees);

    // Update the UI after assigning the task
    updateTaskListUI();
  }

  // Function to update the task list UI
  function updateTaskListUI() {
    if (selectedEmployee?.uid) {
      fetchEmployeeTasks(selectedEmployee.uid).then(tasks => {
        setTasks(tasks);
      });
    }
  }

  // Function to send task assignment email
  function sendTaskAssignmentEmail(employeeEmail, task) {
    // Call the email service to send the email
    emailService.send({
      to: employeeEmail,
      subject: `New Task Assigned: ${task.title}`,
      body: `You have been assigned a new task: ${task.description}`
    });
  }

  // Helper function to get employee email
  function getEmployeeEmail(employeeId) {
    // Retrieve employee email by ID
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.email : null;
  }

  // Function to fetch tasks for a specific employee
  const fetchEmployeeTasks = async (employeeUID) => {
    try {
      console.log("Fetching tasks for employee UID:", employeeUID);

      // Query the Firestore collection for the employee's tasks
      const tasksSnapshot = await getDocs(
        query(
          collection(db, 'employee_tasks'),
          where('assignedTo.uid', '==', employeeUID)
        )
      );

      return tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        deadline: doc.data().deadline?.toDate?.() || null,
        createdAt: doc.data().createdAt?.toDate?.() || null,
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  };

  // Function to fetch all assigned employee tasks
  const fetchAssignedEmployeeTasks = async () => {
    try {
      console.log("Fetching all assigned employee tasks...");

      // Query the Firestore collection for all employee tasks
      const tasksSnapshot = await getDocs(query(collection(db, 'employee_tasks'), orderBy('createdAt', 'desc')));
      const tasks = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        deadline: doc.data().deadline?.toDate?.() || null,
        createdAt: doc.data().createdAt?.toDate?.() || null,
      }));

      console.log("Fetched assigned employee tasks:", tasks); // Debugging log
      setTasks(tasks); // Update the tasks state
    } catch (error) {
      console.error('Error fetching assigned employee tasks:', error);
    }
  };

  // Combine unassigned_tasks and employee_tasks into one list
  useEffect(() => {
    const fetchTasks = async () => {
      const [unassignedSnap, assignedSnap] = await Promise.all([
        getDocs(collection(db, 'unassigned_tasks')),
        getDocs(collection(db, 'employee_tasks')),
      ]);

      const unassignedTasks = unassignedSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        source: 'unassigned',
        createdAt: doc.data().createdAt?.toDate?.() || null,
        deadline: doc.data().deadline?.toDate?.() || null,
      }));

      const assignedTasks = assignedSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        source: 'assigned',
        createdAt: doc.data().createdAt?.toDate?.() || null,
        deadline: doc.data().deadline?.toDate?.() || null,
      }));

      setEmployeeTasks([...unassignedTasks, ...assignedTasks].sort((a, b) =>
        a.assignedTo ? 1 : -1
      )); // Optional: Sort unassigned tasks first
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      const allTasks = await fetchAllEmployeeTasks();
      setEmployeeTasks(allTasks);
    };
    loadTasks();
  }, []);

  useEffect(() => {
    if (!selectedEmployee?.uid) return;

    const loadEmployeeTasks = async () => {
      const tasks = await fetchEmployeeTasks(selectedEmployee.uid);
      setEmployeeTasks(tasks); // Update the employeeTasks state
      console.log("Updated employeeTasks state:", tasks); // Debugging log
    };

    loadEmployeeTasks();
  }, [selectedEmployee?.uid]);

  useEffect(() => {
    fetchAssignedEmployeeTasks(); // Ensure this function is properly defined and called

    // Set up a listener for real-time updates
    const employeeTasksUnsubscribe = onSnapshot(
      query(collection(db, 'employee_tasks'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const updatedTasks = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          updatedTasks.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt ? (typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : new Date(data.createdAt)) : new Date(),
            deadline: data.deadline ? (typeof data.deadline.toDate === 'function' ? data.deadline.toDate() : new Date(data.deadline)) : null,
          });
        });
        setTasks(updatedTasks);
      }
    );

    const adminTasksUnsubscribe = onSnapshot(
      query(collection(db, 'admin_tasks'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const updatedAdminTasks = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          updatedAdminTasks.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt ? (typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : new Date(data.createdAt)) : new Date(),
            deadline: data.deadline ? (typeof data.deadline.toDate === 'function' ? data.deadline.toDate() : new Date(data.deadline)) : null,
          });
        });
        setAdminTasks(updatedAdminTasks);
        setAdminLoading(false);
      }
    );

    // Clean up listeners on unmount
    return () => {
      employeeTasksUnsubscribe();
      adminTasksUnsubscribe();
    };
  }, []);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get priority badge class
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-danger';
      case 'medium':
        return 'bg-warning';
      case 'low':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'in-progress':
        return 'bg-info';
      case 'completed':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#ff4d4d';
    if (event.status === 'completed') {
      backgroundColor = '#4CAF50';
    } else if (event.type === 'admin') {
      backgroundColor = '#0d6efd';
    }

    const style = {
      backgroundColor,
      borderRadius: '5px',
      opacity: event.status === 'completed' ? 0.7 : 1,
      color: 'white',
      border: '0px',
      display: 'block'
    };
    return {
      style: style
    };
  };

  const events = formatCalendarEvents();

  // Update filteredEmployeeTasks to show all tasks
  const filteredEmployeeTasks = employeeTasks; // ✅ Show all tasks

  return (
    <Layout>
      <div>
        {/* Enhanced Title Styling */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h1 className="display-4 fw-bold text-primary mb-0">
            Task Management
            <div className="title-underline bg-primary mt-2"></div>
          </h1>
        </div>

        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/admin/dashboard">Dashboard</Link>
            </li>
            <li className="breadcrumb-item active">Task Management</li>
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
                  <h2 className="calendar-title">{formatMonthYear(selectedDate)}</h2>
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
                      >
                        <div className="day-number">{day.day}</div>
                        {day.tasks && day.tasks.length > 0 && (
                          <div className="task-indicators">
                            {day.tasks.map((task, taskIndex) => (
                              <div
                                key={taskIndex}
                                className={`task-indicator ${task.type === 'admin' ? 'admin-task' : 'employee-task'} ${task.status === 'completed' ? 'completed' : ''}`}
                                title={`${task.title} (${task.type === 'admin' ? 'Admin' : 'Employee'})`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Calendar Legend */}
                <div className="calendar-legend">
                  <div className="legend-title">Task Types:</div>
                  <div className="legend-items">
                    <div className="legend-item">
                      <div className="legend-indicator employee-task"></div>
                      <span>Employee Tasks</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-indicator admin-task"></div>
                      <span>Admin Tasks</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-indicator completed"></div>
                      <span>Completed Tasks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Management Cards */}
        <div className="row g-3 mb-4">
          {/* Task Operations Card */}
          <div className="col-md-6">
            <div className="card shadow-sm h-100 gradient-card-primary">
              <div className="card-header bg-transparent text-white">
                <h5 className="mb-0">Task Operations</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  <button onClick={handleCreateTask} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <div className="icon-circle bg-primary text-white me-3">
                      <i className="bi bi-plus-circle"></i>
                    </div>
                    <div className="d-flex flex-column">
                      <span className="fw-bold">Create Task</span>
                      <small className="text-muted">Create a new task for your team</small>
                    </div>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                  <button onClick={navigateToAssignTask} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button assign-task-button">
                    <div className="icon-circle bg-success text-white me-3">
                      <i className="bi bi-person-check"></i>
                    </div>
                    <div className="d-flex flex-column">
                      <span className="fw-bold">Assign Task</span>
                      <small className="text-muted">Distribute tasks to team members</small>
                    </div>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                  <button onClick={handleEditDeleteTasks} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <div className="icon-circle bg-info text-white me-3">
                      <i className="bi bi-pencil-square"></i>
                    </div>
                    <div className="d-flex flex-column">
                      <span className="fw-bold">Edit/Delete Tasks</span>
                      <small className="text-muted">Modify or remove existing tasks</small>
                    </div>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                  {/* Removed Task Status button */}
                </div>
              </div>
            </div>
          </div>

          {/* Task Administration Card */}
          <div className="col-md-6">
            <div className="card shadow-sm h-100 gradient-card-secondary">
              <div className="card-header bg-transparent text-white">
                <h5 className="mb-0">Task Administration</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  <button 
                    onClick={handleCreateAdminTask} 
                    className="list-group-item-action d-flex align-items-center p-3 action-button"
                  >
                    <div className="icon-circle bg-purple text-white me-3">
                      <i className="bi bi-plus-circle"></i>
                    </div>
                    <div className="d-flex flex-column">
                      <span className="fw-bold">Create Admin Task</span>
                      <small className="text-muted">Create tasks for yourself as an admin</small>
                    </div>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>

                  <button 
                    onClick={handleEditDeleteAdminTasks} 
                    className="list-group-item-action d-flex align-items-center p-3 action-button"
                  >
                    <div className="icon-circle bg-teal text-white me-3">
                      <i className="bi bi-pencil-square"></i>
                    </div>
                    <div className="d-flex flex-column">
                      <span className="fw-bold">Edit/Delete Admin Tasks</span>
                      <small className="text-muted">Modify or remove your admin tasks</small>
                    </div>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>

                  <button 
                    onClick={handleAdminTaskStatus} 
                    className="list-group-item-action d-flex align-items-center p-3 action-button"
                  >
                    <div className="icon-circle bg-orange text-white me-3">
                      <i className="bi bi-flag"></i>
                    </div>
                    <div className="d-flex flex-column">
                      <span className="fw-bold">Admin Task Status</span>
                      <small className="text-muted">Track and update your task progress</small>
                    </div>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List Section */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0 text-white">Employee Tasks</h5>
            <span className="badge bg-light text-primary">{filteredEmployeeTasks.length} tasks</span>
          </div>
          <div className="card-body p-0">
            {filteredEmployeeTasks.length === 0 ? (
              <div className="text-center p-4">
                <i className="bi bi-clipboard-x text-muted" style={{ fontSize: '2rem' }}></i>
                <p className="mt-2">No tasks created yet</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0 task-table">
                  <thead className="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Assigned To</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployeeTasks.map((task, index) => (
                      <tr key={index} className="task-row">
                        <td>
                          <div className="fw-bold text-dark">{task.title}</div>
                          <small className="text-muted">{task.description?.substring(0, 50)}...</small>
                        </td>
                        <td>
                          <span className={`badge ${task.assignedTo ? 'bg-info' : 'bg-secondary'}`}>
                            {task.assignedTo?.name || 'Unassigned'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                            {task.priority || 'medium'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                            {task.status || 'pending'}
                          </span>
                        </td>
                        <td>
                          <span className="text-dark">
                            {task.deadline ? new Date(task.deadline).toLocaleString() : 'No deadline'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Admin Tasks List Section */}
        <div className="card shadow-sm mb-4 admin-tasks-card">
          <div className="card-header bg-purple text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0 text-white">Admin Tasks</h5>
            <span className="badge bg-light text-purple">{adminTasks.length} tasks</span>
          </div>
          <div className="card-body p-0">
            {adminLoading ? (
              <div className="text-center p-4">
                <div className="spinner-border text-purple" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading admin tasks...</p>
              </div>
            ) : adminTasks.length === 0 ? (
              <div className="text-center p-4">
                <i className="bi bi-person-badge text-muted" style={{ fontSize: '2rem' }}></i>
                <p className="mt-2">No admin tasks created yet</p>
                <button 
                  onClick={handleAdminTasks}
                  className="btn btn-purple mt-2"
                >
                  Create Admin Task
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0 admin-task-table">
                  <thead className="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminTasks.map((task) => (
                      <tr key={task.id} className="admin-task-row">
                        <td>
                          <div className="fw-bold text-dark">{task.title}</div>
                          <small className="text-muted">{task.description?.substring(0, 50)}...</small>
                        </td>
                        <td>
                          <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                            {task.priority || 'medium'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                            {task.status || 'pending'}
                          </span>
                        </td>
                        <td>
                          <span className="text-dark">{task.deadline ? formatDate(task.deadline) : 'No deadline'}</span>
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
        }
        
        .action-button {
          transition: all 0.3s ease;
          border: none;
          background: transparent;
          text-align: left;
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

        .task-row {
          transition: all 0.2s ease;
        }

        .task-row:hover {
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
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          background: rgba(44, 62, 80, 0.1);
          color: #2c3e50;
        }

        .action-button:hover .icon-circle {
          background: rgba(44, 62, 80, 0.2);
        }

        .gradient-card-primary {
          background: linear-gradient(135deg, #e8eeff 0%, #d1dff9 100%);
          color: #2c3e50;
        }

        .gradient-card-secondary {
          background: linear-gradient(135deg, #e6f7f0 0%, #d1f2e6 100%);
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
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
        }

        .bg-purple {
          background-color: #6f42c1;
        }

        .bg-teal {
          background-color: #20c997;
        }

        .bg-orange {
          background-color: #fd7e14;
        }

        .bg-indigo {
          background-color: #6610f2;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .card {
          animation: fadeIn 0.5s ease-out;
        }

        .task-table {
          background-color: #f8f9fc;
        }
        
        .admin-task-table {
          background-color: #f8f9fc;
        }
        
        .task-row {
          transition: all 0.2s ease;
        }

        .task-row:hover {
          background-color: rgba(0, 123, 255, 0.05);
        }

        .admin-task-row {
          transition: all 0.2s ease;
        }

        .admin-task-row:hover {
          background-color: rgba(111, 66, 193, 0.05);
        }

        .admin-tasks-card {
          border-top: 3px solid #6f42c1;
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
          position: relative;
          min-height: 100px;
          padding: 5px;
        }

        .day-number {
          font-weight: bold;
          margin-bottom: 5px;
        }

        .task-indicators {
          display: flex;
          flex-wrap: wrap;
          gap: 3px;
          margin-top: 2px;
        }

        .task-indicator {
          width: 12px;
          height: 12px;
          border-radius: 3px;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .admin-task {
          background-color: #0d6efd;
          border-color: #0a58ca;
        }

        .employee-task {
          background-color: #ff4d4d;
          border-color: #dc3545;
        }

        .completed {
          opacity: 0.7;
          position: relative;
        }

        .completed::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 8px;
          height: 2px;
          background-color: white;
          transform: translate(-50%, -50%) rotate(-45deg);
        }

        .task-indicator:hover {
          transform: scale(1.2);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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

        .today-btn {
          margin-left: 8px;
        }

        .bg-brown {
          background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
        }

        .calendar-day:hover {
          background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
          color: white;
        }

        .calendar-day:hover .task-indicator {
          border-color: rgba(255, 255, 255, 0.5);
        }

        /* Calendar Legend */
        .calendar-legend {
          margin-top: 20px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .legend-title {
          font-weight: 600;
          color: #2e7d32;
          margin-bottom: 10px;
        }

        .legend-items {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend-indicator {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .legend-indicator.employee-task {
          background-color: #ff4d4d;
        }

        .legend-indicator.admin-task {
          background-color: #0d6efd;
        }

        .legend-indicator.completed {
          background-color: #4CAF50;
          opacity: 0.7;
        }
      `}</style>
    </Layout>
  );
}
