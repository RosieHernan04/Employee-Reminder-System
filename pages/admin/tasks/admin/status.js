'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../../components/Layout/layout';
import {
  collection,
  query,
  orderBy,
  doc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

export default function AdminTaskStatus() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: '',
    progress: 0,
    notes: '',
  });
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'admin_tasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        deadline: doc.data().deadline?.toDate() || null,
      }));
      setTasks(taskData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusClick = (task) => {
    setSelectedTask(task);
    setStatusForm({
      status: task.status || 'pending',
      progress: task.progress || 0,
      notes: task.statusNotes || '',
    });
    setShowStatusModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStatusForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProgressChange = (e) => {
    const value = parseInt(e.target.value);
    setStatusForm((prev) => ({ ...prev, progress: value }));
  };

  const handleCloseModal = () => {
    setShowStatusModal(false);
    setSelectedTask(null);
  };

  const handleStatusUpdate = async () => {
    try {
      if (!selectedTask) return;
      const taskRef = doc(db, 'admin_tasks', selectedTask.id);
      await updateDoc(taskRef, {
        status: statusForm.status,
        progress: statusForm.progress,
        statusNotes: statusForm.notes,
        updatedAt: new Date(),
      });
      handleCloseModal();
      alert('Task status updated successfully!');
    } catch (error) {
      console.error('Error updating task status:', error);
      alert(error.message || 'An unexpected error occurred.');
    }
  };

  const markAsCompleted = async (taskId) => {
    try {
      const taskRef = doc(db, 'admin_tasks', taskId);
      await updateDoc(taskRef, {
        status: 'completed',
        progress: 100,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error marking task as completed:', error);
      alert(error.message || 'Failed to mark task as complete.');
    }
  };

  const filteredTasks = filterStatus === 'all'
    ? tasks
    : tasks.filter((task) => task.status === filterStatus);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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

  const getProgressBarColor = (progress) => {
    if (progress < 30) return 'bg-danger';
    if (progress < 70) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <Layout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="display-4 fw-bold text-primary mb-0">
            <i className="bi bi-kanban me-2"></i>Admin Task Status
            <div className="title-underline bg-primary mt-2"></div>
          </h1>
          <button onClick={() => router.back()} className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>Back
          </button>
        </div>

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <label className="me-2 fw-bold">Filter by Status:</label>
              <div className="btn-group">
                {['all', 'pending', 'in-progress', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    className={`btn ${
                      filterStatus === status
                        ? `btn-${status === 'all' ? 'primary' : status === 'in-progress' ? 'info' : status}`
                        : `btn-outline-${status === 'all' ? 'primary' : status === 'in-progress' ? 'info' : status}`
                    }`}
                    onClick={() => setFilterStatus(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-header bg-white border-bottom">
            <h5 className="mb-0">Task List</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Deadline</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <div className="fw-bold">{task.title}</div>
                        <small className="text-muted">
                          {task.description?.substring(0, 50)}...
                        </small>
                      </td>
                      <td>
                        <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td>
                        <div className="progress" style={{ height: '20px' }}>
                          <div
                            className={`progress-bar ${getProgressBarColor(task.progress)}`}
                            role="progressbar"
                            style={{ width: `${task.progress}%` }}
                            aria-valuenow={task.progress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            {task.progress}%
                          </div>
                        </div>
                      </td>
                      <td>{formatDate(task.deadline)}</td>
                      <td>
                        {task.status !== 'completed' && (
                          <>
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleStatusClick(task)}
                            >
                              <i className="bi bi-pencil-square me-1"></i>Update
                            </button>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => markAsCompleted(task.id)}
                            >
                              <i className="bi bi-check-circle me-1"></i>Complete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Status Modal */}
        {showStatusModal && (
          <>
            <div className="modal-backdrop show"></div>
            <div className="modal fade show d-block" tabIndex="-1">
              <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">Update Task Status</h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={handleCloseModal}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <h5 className="mb-2">Task Details</h5>
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <p>
                          <strong>Title:</strong> {selectedTask?.title}
                        </p>
                        <p>
                          <strong>Description:</strong> {selectedTask?.description}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p>
                          <strong>Priority:</strong>{' '}
                          <span className={`badge ${getPriorityBadgeClass(selectedTask?.priority)}`}>
                            {selectedTask?.priority}
                          </span>
                        </p>
                        <p>
                          <strong>Deadline:</strong> {formatDate(selectedTask?.deadline)}
                        </p>
                      </div>
                    </div>
                    <form onSubmit={(e) => e.preventDefault()}>
                      <div className="mb-3">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          name="status"
                          value={statusForm.status}
                          onChange={handleInputChange}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Progress</label>
                        <input
                          type="range"
                          className="form-range"
                          min="0"
                          max="100"
                          value={statusForm.progress}
                          onChange={handleProgressChange}
                        />
                        <div>{statusForm.progress}%</div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Notes</label>
                        <textarea
                          className="form-control"
                          name="notes"
                          rows="3"
                          value={statusForm.notes}
                          onChange={handleInputChange}
                        ></textarea>
                      </div>
                    </form>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleStatusUpdate}>
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
