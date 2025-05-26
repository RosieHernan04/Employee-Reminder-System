import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout/layout';
import { collection, query, orderBy, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../dataconnect/firebase';
import { Modal, Form } from 'react-bootstrap';
import { logAdminActivity, ADMIN_ACTIONS } from '../../../utils/adminLogger';
import { useUser } from '../../../dataconnect/context/UserContext';

export default function TaskStatus() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', progress: 0, notes: '' });
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const tasksQuery = query(collection(db, 'employee_tasks'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(tasksQuery);
      const tasksData = [];

      for (const docSnap of querySnapshot.docs) {
        const taskData = {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          deadline: docSnap.data().deadline?.toDate() || null,
          assignedEmployeeNames: []
        };

        if (taskData.assignedEmployees && taskData.assignedEmployees.length > 0) {
          for (const employeeId of taskData.assignedEmployees) {
            try {
              const employeeDoc = await getDoc(doc(db, 'employees', employeeId));
              if (employeeDoc.exists()) {
                taskData.assignedEmployeeNames.push(employeeDoc.data().name);
              }
            } catch (error) {
              console.error('Error fetching employee:', error);
            }
          }
        }

        tasksData.push(taskData);
      }

      setTasks(tasksData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    // Clean up scroll lock if component unmounts while modal is open
    return () => {
      if (typeof window !== "undefined") {
        document.body.style.overflow = '';
      }
    };
  }, []);

  const handleStatusClick = (task) => {
    setSelectedTask(task);
    setStatusForm({
      status: task.status || 'pending',
      progress: task.progress || 0,
      notes: task.statusNotes || ''
    });
    setShowStatusModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStatusForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProgressChange = (e) => {
    setStatusForm(prev => ({ ...prev, progress: parseInt(e.target.value) }));
  };

  const handleCloseModal = () => {
    setShowStatusModal(false);
    setSelectedTask(null);
    // Always restore scroll on modal close
    if (typeof window !== "undefined") {
      document.body.style.overflow = '';
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const taskRef = doc(db, 'employee_tasks', selectedTask.id);
      const wasCompleted = selectedTask.status === 'completed';
      const isNowCompleted = statusForm.status === 'completed';

      await updateDoc(taskRef, {
        status: statusForm.status,
        progress: statusForm.progress,
        statusNotes: statusForm.notes,
        updatedAt: new Date()
      });

      if (!wasCompleted && isNowCompleted) {
        await logAdminActivity(
          user?.uid,
          user?.displayName || user?.email,
          ADMIN_ACTIONS.TASK_COMPLETED,
          `Task "${selectedTask.title}" marked as completed`,
          'Task',
          selectedTask.id
        );
      }

      if (isNowCompleted && selectedTask.assignedEmployees?.length) {
        for (const employeeId of selectedTask.assignedEmployees) {
          try {
            const employeeTaskRef = doc(db, 'employee_tasks', `${employeeId}_${selectedTask.id}`);
            await updateDoc(employeeTaskRef, {
              status: 'completed',
              progress: 100,
              statusNotes: statusForm.notes,
              updatedAt: new Date()
            });
          } catch (error) {
            console.error(`Error updating employee task for ${employeeId}:`, error);
          }
        }
      }

      setTasks(prevTasks => prevTasks.map(task =>
        task.id === selectedTask.id ? {
          ...task,
          status: statusForm.status,
          progress: statusForm.progress,
          statusNotes: statusForm.notes
        } : task
      ));

      handleCloseModal();
      alert('Task status updated successfully!');
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      alert(error.code === 'permission-denied' ? 'You do not have permission to update this task.' : 'An unexpected error occurred. Please try again.');
    }
  };

  const filteredTasks = filterStatus === 'all' ? tasks : tasks.filter(task => task.status === filterStatus);

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
  const getPriorityBadgeClass = (priority) => priority === 'high' ? 'bg-danger' : priority === 'medium' ? 'bg-warning' : 'bg-success';
  const getStatusBadgeClass = (status) => status === 'pending' ? 'bg-warning' : status === 'in-progress' ? 'bg-info' : status === 'completed' ? 'bg-success' : 'bg-danger';
  const getProgressBarColor = (progress) => progress < 30 ? 'bg-danger' : progress < 70 ? 'bg-warning' : 'bg-success';

  return (
    <Layout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-primary">Task Status</h1>
          <button onClick={() => router.push('/admin/usermanagement')} className="btn btn-outline-primary">
            <i className="bi bi-arrow-left me-2"></i> Back
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="mb-3">
          <label className="me-2 fw-bold">Filter by Status:</label>
          {['all', 'pending', 'in-progress', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              className={`btn me-2 ${filterStatus === status ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Task Table */}
        <div className="card">
          <div className="card-header">Task List</div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Deadline</th>
                  <th>Assigned</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td><span className={`badge ${getPriorityBadgeClass(task.priority)}`}>{task.priority}</span></td>
                    <td><span className={`badge ${getStatusBadgeClass(task.status)}`}>{task.status}</span></td>
                    <td>
                      <div className="progress">
                        <div
                          className={`progress-bar ${getProgressBarColor(task.progress)}`}
                          style={{ width: `${task.progress}%` }}
                        >
                          {task.progress}%
                        </div>
                      </div>
                    </td>
                    <td>{formatDate(task.deadline)}</td>
                    <td>{task.assignedEmployeeNames.join(', ') || 'Unassigned'}</td>
                    <td>
                      {task.status !== 'completed' && (
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleStatusClick(task)}>
                          Update
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Modal */}
        <Modal show={showStatusModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Update Task Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select name="status" value={statusForm.status} onChange={handleInputChange}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Progress</Form.Label>
                <Form.Range value={statusForm.progress} onChange={handleProgressChange} />
                <div>{statusForm.progress}%</div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  name="notes"
                  value={statusForm.notes}
                  onChange={handleInputChange}
                  rows={3}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
            <button className="btn btn-primary" onClick={handleStatusUpdate}>Update</button>
          </Modal.Footer>
        </Modal>
      </div>
    </Layout>
  );
}