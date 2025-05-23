import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, Timestamp, getDocs, orderBy, limit } from 'firebase/firestore';
import Layout from '../../components/Layout/layout';
import { Modal, Button, Form } from 'react-bootstrap';
import { CheckCircleIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { enUS } from 'date-fns/locale';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useUser } from '../../dataconnect/context/UserContext';
import { logEmployeeActivity } from '../../utils/logActivity';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS }
});

export default function MyTasks() {
  const router = useRouter();
  const { user } = useUser();
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: new Date(),
    dueTime: '09:00',
    priority: 'Medium',
  });
  const [success, setSuccess] = useState('');
  const [upcomingTasks, setUpcomingTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [upcomingMeetings, setUpcomingMeetings] = useState(0);
  const [employeeActivities, setEmployeeActivities] = useState([]);
  const [banner, setBanner] = useState({ show: false, message: '', variant: 'success' });

  // Helper to show banner
  const showBanner = (message, variant = 'success') => {
    setBanner({ show: true, message, variant });
    setTimeout(() => setBanner({ show: false, message: '', variant }), 4000);
  };

  async function fetchDashboardData(userId) {
    try {
      setLoading(true);
      setError(null);
      const now = Timestamp.now();

      // UPCOMING Meetings
      const meetingQueries = [
        query(collection(db, 'employee_meetings'), where('userId', '==', userId), where('start', '>=', now)),
        query(collection(db, 'employee_meetings'), where('assignedTo.uid', '==', userId), where('start', '>=', now))
      ];
      const meetingSnapshots = await Promise.all(meetingQueries.map(getDocs));
      const allMeetings = meetingSnapshots.reduce((sum, snap) => sum + snap.size, 0);
      setUpcomingMeetings(allMeetings);

      // UPCOMING Tasks (exclude completed)
      const assignedUpcomingQuery = query(
        collection(db, 'employee_tasks'),
        where('assignedTo.uid', '==', userId),
        where('status', '!=', 'completed')
      );
      const selfUpcomingQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('status', '!=', 'completed')
      );
      const [assignedUpcomingSnap, selfUpcomingSnap] = await Promise.all([
        getDocs(assignedUpcomingQuery),
        getDocs(selfUpcomingQuery)
      ]);
      const totalUpcomingTasks = assignedUpcomingSnap.size + selfUpcomingSnap.size;
      setUpcomingTasks(totalUpcomingTasks);

      // COMPLETED Tasks
      const assignedCompletedQuery = query(
        collection(db, 'employee_tasks'),
        where('assignedTo.uid', '==', userId),
        where('status', '==', 'completed')
      );
      const selfCompletedQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('status', '==', 'completed')
      );
      const [assignedCompletedSnap, selfCompletedSnap] = await Promise.all([
        getDocs(assignedCompletedQuery),
        getDocs(selfCompletedQuery)
      ]);
      const totalCompletedTasks = assignedCompletedSnap.size + selfCompletedSnap.size;
      setCompletedTasks(totalCompletedTasks);

      // Activity Logs (limit to 10 for performance)
      const activitiesQuery = query(
        collection(db, `employee_activities/${userId}/activities`),
        orderBy('timestamp', 'desc'),
        limit(10) // Limit to 10 for performance
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);
      const activities = activitiesSnapshot.docs.map(doc => doc.data());
      setEmployeeActivities(activities);

    } catch (err) {
      console.error('🔥 Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user?.uid) return;

    fetchDashboardData(user.uid);

    const employeeTasksQuery = query(
      collection(db, "employee_tasks"),
      where("assignedTo.uid", "==", user.uid)
    );

    const tasksQuery = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid)
    );

    const unsubscribeEmployeeTasks = onSnapshot(employeeTasksQuery, (snapshot) => {
      const employeeTasksList = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description,
        dueDate: doc.data().deadline ? doc.data().deadline.toDate() : null, // Use deadline
        dueTime: format(doc.data().deadline?.toDate(), 'HH:mm') || '09:00', // Extract time from deadline
        type: "employee",
        priority: doc.data().priority,
        status: doc.data().status,
      }));

      setAllTasks(prevTasks => {
        const personalOnly = prevTasks.filter(t => t.type === "personal");
        return [...personalOnly, ...employeeTasksList];
      });
    });

    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksList = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description,
        dueDate: doc.data().dueDate ? doc.data().dueDate.toDate() : null, // Use dueDate
        dueTime: doc.data().dueTime || '09:00', // Use dueTime
        type: "personal",
        priority: doc.data().priority,
        status: doc.data().status,
      }));

      setAllTasks(prevTasks => {
        const employeeOnly = prevTasks.filter(t => t.type === "employee");
        return [...employeeOnly, ...tasksList];
      });
    });

    return () => {
      unsubscribeEmployeeTasks();
      unsubscribeTasks();
    };
  }, [user]);

  const formatDateForDisplay = (date, time) => {
    if (!date) return '';
    if (date instanceof Date) {
      return `${format(date, 'MMM dd, yyyy')} ${time || format(date, 'HH:mm')}`;
    }
    if (date instanceof Timestamp) {
      const convertedDate = date.toDate();
      return `${format(convertedDate, 'MMM dd, yyyy')} ${time || format(convertedDate, 'HH:mm')}`;
    }
    return '';
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    if (date instanceof Date) {
      return format(date, 'yyyy-MM-dd');
    }
    if (date instanceof Timestamp) {
      return format(date.toDate(), 'yyyy-MM-dd');
    }
    return '';
  };

  const formatCalendarEvents = () => {
    return allTasks.map(task => ({
      id: task.id,
      title: task.title,
      start: task.dueDate instanceof Timestamp ? task.dueDate.toDate() : new Date(task.dueDate),
      end: task.dueDate instanceof Timestamp ? task.dueDate.toDate() : new Date(task.dueDate),
      allDay: false,
      resource: {
        type: task.type,
        status: task.status,
        priority: task.priority,
        assignedBy: task.type === 'assigned' ? task.assignedTo : null
      }
    }));
  };

  const eventStyleGetter = (event) => {
    const isAssigned = event.resource.type === 'assigned';
    const priorityColors = {
      high: '#dc3545',
      medium: '#ffc107',
      low: '#28a745'
    };
    
    const statusColors = {
      pending: '#007bff',
      'in-progress': '#17a2b8',
      completed: '#28a745'
    };

    return {
      style: {
        backgroundColor: isAssigned ? statusColors[event.resource.status] : priorityColors[event.resource.priority.toLowerCase()],
        border: 'none',
        opacity: 0.8
      }
    };
  };

  // Helper to check if a date is in the current month and year
  const isCurrentMonth = (date) => {
    if (!date) return false;
    const d = date instanceof Date ? date : (date instanceof Timestamp ? date.toDate() : new Date(date));
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  };

  // Filter tasks to only show those due in the current month
  const filteredTasks = allTasks.filter(task => isCurrentMonth(task.dueDate));

  const renderTaskList = () => {
    return (
      <div className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 
            className="mb-0" 
            style={{ 
              color: "#2d8659", 
              fontWeight: "bold",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)"
            }}
          >
            My Tasks
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
                    <th>Due Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Assigned To</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td>{task.title}</td>
                      <td>{formatDateForDisplay(task.dueDate, task.dueTime)}</td>
                      <td>
                        <span className={`badge bg-${task.priority.toLowerCase() === 'high' ? 'danger' : task.priority.toLowerCase() === 'medium' ? 'warning' : 'info'}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${task.status === 'completed' ? 'success' : 'primary'}`}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${task.type === 'assigned' ? 'secondary' : 'primary'}`}>
                          {task.type === 'assigned' ? 'Assigned by Admin' : 'Personal Task'}
                        </span>
                      </td>
                      <td>
                        {task.assignedTo ? task.assignedTo.fullName || task.assignedTo.name || 'Unknown' : 'Personal Task'}
                      </td>
                      <td>
                        <div className="btn-group" role="group" style={{ gap: '4px' }}>
                          {task.status !== 'completed' && (
                            <button
                              className="btn btn-success d-flex align-items-center"
                              onClick={() => completeTask(task.id)}
                              disabled={loading}
                              title="Complete Task"
                              style={{
                                padding: '8px 12px',
                                background: '#2d8659',
                                border: 'none',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                backdropFilter: 'blur(10px)',
                                minWidth: '100px',
                                justifyContent: 'center'
                              }}
                            >
                              <CheckCircleIcon className="h-5 w-5 me-1" />
                              <span>Complete</span>
                            </button>
                          )}
                          {task.type === 'personal' && (
                            <>
                              <button
                                className="btn btn-primary d-flex align-items-center"
                                onClick={() => handleEditTask(task)}
                                disabled={loading || task.status === 'completed'}
                                title="Edit Task"
                                style={{
                                  padding: '8px 12px',
                                  background: '#0d6efd',
                                  border: 'none',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                  backdropFilter: 'blur(10px)',
                                  minWidth: '80px',
                                  justifyContent: 'center'
                                }}
                              >
                                <PencilIcon className="h-5 w-5 me-1" />
                                <span>Edit</span>
                              </button>
                              <button
                                className="btn btn-danger d-flex align-items-center"
                                onClick={() => handleDeleteTask(task.id)}
                                disabled={loading}
                                title="Delete Task"
                                style={{
                                  padding: '8px 12px',
                                  background: '#dc3545',
                                  border: 'none',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                  backdropFilter: 'blur(10px)',
                                  minWidth: '90px',
                                  justifyContent: 'center'
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

  const addTask = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const tasksRef = collection(db, 'tasks');
      
      // Convert dueDate to Firestore Timestamp
      const dueDateTime = new Date(newTask.dueDate);
      const [hours, minutes] = newTask.dueTime.split(':');
      dueDateTime.setHours(parseInt(hours), parseInt(minutes));
      
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        dueDate: Timestamp.fromDate(dueDateTime),
        dueTime: newTask.dueTime,
        priority: newTask.priority,
        userId: user.uid,
        createdBy: user.uid,
        createdAt: Timestamp.fromDate(new Date()),
        status: 'pending',
        type: 'personal'
      };
      
      const taskDoc = await addDoc(tasksRef, taskData);
      await logEmployeeActivity(user.uid, 'created_task', 'task', taskDoc.id, user.uid, { taskTitle: newTask.title }); // Log activity
      setSuccess('Task created successfully!');
      showBanner('Task created successfully!', 'success');
      
      // Reset state
      setShowTaskForm(false);
      setNewTask({
        title: '',
        description: '',
        dueDate: new Date(),
        dueTime: '09:00',
        priority: 'Medium',
      });
      
      // Refresh task list
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const taskRef = doc(db, 'tasks', editingTask.id);
      
      // Convert dueDate to Firestore Timestamp
      const dueDateTime = new Date(newTask.dueDate);
      const [hours, minutes] = newTask.dueTime.split(':');
      dueDateTime.setHours(parseInt(hours), parseInt(minutes));
      
      await updateDoc(taskRef, {
        title: newTask.title,
        description: newTask.description,
        dueDate: Timestamp.fromDate(dueDateTime),
        dueTime: newTask.dueTime,
        priority: newTask.priority,
        updatedAt: Timestamp.fromDate(new Date())
      });
      
      setSuccess('Task updated successfully!');
      showBanner('Task updated successfully!', 'info');
      setShowTaskForm(false);
      setEditingTask(null);
      setNewTask({
        title: '',
        description: '',
        dueDate: new Date(),
        dueTime: '09:00',
        priority: 'Medium',
      });
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task) => {
    if (task.type === 'assigned') {
      setError('You cannot edit tasks assigned by admin');
      return;
    }
    setEditingTask(task);
    setNewTask({
      ...task,
      dueDate: task.dueDate instanceof Timestamp ? task.dueDate.toDate() : task.dueDate
    });
    setShowTaskForm(true);
  };

  const handleDeleteTask = (taskId) => {
    const task = allTasks.find(t => t.id === taskId);
    if (task && task.type === 'assigned') {
      setError('You cannot delete tasks assigned by admin');
      return;
    }
    setTaskToDelete(taskId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTask = async () => {
    try {
      setLoading(true);
      const task = allTasks.find(t => t.id === taskToDelete);
      if (task) {
        if (task.type === 'personal') {
          await deleteDoc(doc(db, 'tasks', taskToDelete));
          setSuccess('Task deleted successfully!');
        } else {
          setError('You cannot delete tasks assigned by admin');
        }
      }
      
      // Refresh task list
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
    }
  };

  const completeTask = async (taskId) => {
    try {
      setLoading(true);
      
      // Find the task to determine its type
      const task = allTasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      const updateData = {
        status: 'completed',
        completedAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      };

      // Update based on task type
      if (task.type === 'personal') {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, updateData);
      } else if (task.type === 'employee') { // Handle assigned tasks
        const taskRef = doc(db, 'employee_tasks', taskId);
        await updateDoc(taskRef, updateData);

        // Reflect changes on admin meeting management
        const adminTaskRef = doc(db, 'admin_meeting_tasks', taskId);
        await updateDoc(adminTaskRef, updateData);
      }

      await logEmployeeActivity(user.uid, 'completed_task', 'task', taskId, user.uid, { taskTitle: task.title }); // Log activity
      setSuccess('Task marked as completed!');
      showBanner('Task marked as completed!', 'success');
      
      // Refresh task list
      fetchTasks();
    } catch (error) {
      console.error('Error completing task:', error);
      setError('Failed to complete task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const assignTaskToEmployee = async (taskData, employeeId) => {
    const employeeTasksRef = collection(db, 'employee_tasks');
    
    const taskDataWithDueDate = {
      ...taskData,
      assignedTo: {
        uid: employeeId,
        name: employeeData.fullName,
        email: employeeData.email
      },
      dueDate: taskData.dueDate,
      assignedAt: Timestamp.fromDate(new Date()),
      status: 'assigned',
      updatedAt: Timestamp.fromDate(new Date()),
    };

    await addDoc(employeeTasksRef, taskDataWithDueDate);
  };

  return (
    <Layout>
      <div className="container-fluid py-4 glass-bg">
        {/* Banner */}
        {banner.show && (
          <div className={`alert alert-${banner.variant} alert-dismissible fade show my-tasks-banner`} role="alert">
            <strong>my-tasks:</strong> {banner.message}
            <button type="button" className="btn-close" aria-label="Close" onClick={() => setBanner({ show: false, message: '', variant: banner.variant })}></button>
          </div>
        )}
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
                Tasks Calendar
              </h1>
              <div
                style={{
                  width: "140px",
                  height: "4px",
                  borderRadius: "2px",
                  background: "linear-gradient(90deg, #f9d923 0%, #36e2a0 40%, #1fa2ff 70%, #ff5858 100%)",
                  marginTop: "2px"
                }}
              />
            </div>
            <div className="card shadow-sm glass-section glass-brown">
              <div className="card-body">
                <Calendar
                  localizer={localizer}
                  events={formatCalendarEvents()}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 600 }}
                  onSelectSlot={({ start }) => {
                    setSelectedDate(start);
                    setNewTask({ ...newTask, dueDate: start });
                    setShowTaskForm(true);
                  }}
                  selectable
                  eventPropGetter={eventStyleGetter}
                  dayPropGetter={(date) => ({
                    style: {
                      backgroundColor: date.getDate() % 2 === 0 ? '#d7ccc8' : '#efebe9'
                    }
                  })}
                  components={{
                    toolbar: (props) => (
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <button onClick={() => props.onNavigate('PREV')} className="btn btn-outline-secondary me-2">Prev</button>
                          <button onClick={() => props.onNavigate('NEXT')} className="btn btn-outline-secondary">Next</button>
                        </div>
                        <h5 className="mb-0">{props.label}</h5>
                        <button onClick={() => props.onNavigate('TODAY')} className="btn btn-outline-secondary">Today</button>
                      </div>
                    )
                  }}
                />
              </div>
            </div>
            <div className="d-flex justify-content-center mt-4">
              <Button
                variant="success"
                onClick={() => setShowTaskForm(true)}
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
                Create New Task
              </Button>
            </div>
            <div className="glass-section glass-table-section mt-4">
              {renderTaskList()}
            </div>
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      <Modal show={showTaskForm} onHide={() => {
        setShowTaskForm(false);
        setEditingTask(null);
        setNewTask({
          title: '',
          description: '',
          dueDate: new Date(),
          dueTime: '09:00',
          priority: 'Medium',
        });
      }} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingTask ? 'Edit Task' : 'Create New Task'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={editingTask ? updateTask : addTask}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </Form.Group>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formatDateForInput(newTask.dueDate)}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: new Date(e.target.value) })}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Due Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={newTask.dueTime}
                    onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
                    required
                  />
                </Form.Group>
              </div>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </Form.Select>
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowTaskForm(false);
                  setEditingTask(null);
                  setNewTask({
                    title: '',
                    description: '',
                    dueDate: new Date(),
                    dueTime: '09:00',
                    priority: 'Medium',
                  });
                }}
                className="me-2"
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingTask ? 'Update Task' : 'Create Task'}
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
          Are you sure you want to delete this task?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteTask}>
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
        .glass-section {
          background: rgba(255,255,255,0.18);
          border-radius: 16px;
          box-shadow: 0 2px 12px 0 rgba(31,38,135,0.10);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          padding: 2rem;
          margin-bottom: 2rem;
        }
        .glass-brown {
          background: linear-gradient(135deg, #d7ccc8 0%, #8d6e63 100%);
        }
        .glass-table-section {
          border: 1.5px solid rgba(139,69,19,0.18);
          background: linear-gradient(120deg, rgba(40,167,69,0.10) 0%, rgba(255,193,7,0.10) 40%, rgba(139,69,19,0.10) 100%);
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
        .my-tasks-banner {
          position: fixed;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2000;
          min-width: 320px;
          max-width: 90vw;
          box-shadow: 0 4px 24px rgba(0,0,0,0.12);
          border-radius: 10px;
        }
      `}</style>
    </Layout>
  );
}
