'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../lib/firebase';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import Layout from 'components/MainLayout/Layout';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import the modal components with no SSR
const TaskEditModal = dynamic(() => import('../../../components/modals/TaskEditModal'), { ssr: false });
const TaskDeleteModal = dynamic(() => import('../../../components/modals/TaskDeleteModal'), { ssr: false });

export default function EditDeleteEmployeeTasks() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [unassignedTasks, setUnassignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // Add this line

  useEffect(() => {
    fetchTasks();
    fetchUnassignedTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const tasksQuery = query(
        collection(db, 'employee_tasks'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(tasksQuery);
      const tasksData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const taskData = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
          deadline: data.deadline?.toDate ? data.deadline.toDate() : null
        };
        tasksData.push(taskData);
      });
      setTasks(tasksData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  // Fetch unassigned tasks
  const fetchUnassignedTasks = async () => {
    try {
      const tasksQuery = query(
        collection(db, 'unassigned_tasks'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(tasksQuery);
      const tasksData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const taskData = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
          deadline: data.deadline?.toDate ? data.deadline.toDate() : null
        };
        tasksData.push(taskData);
      });
      setUnassignedTasks(tasksData);
    } catch (error) {
      console.error('Error fetching unassigned tasks:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No deadline';
    return new Date(date).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const handleEdit = (task) => {
    if (task.status === 'completed') {
      alert('Cannot edit a completed task');
      return;
    }
    setSelectedTask(task);
    setShowEditModal(true);
  };

  // Handle edit for unassigned tasks
  const handleEditUnassigned = (task) => {
    setSelectedTask({ ...task, source: 'unassigned' });
    setShowEditModal(true);
  };

  const handleDelete = (task) => {
    setSelectedTask(task);
    setShowDeleteModal(true);
  };

  // Handle delete for unassigned tasks
  const handleDeleteUnassigned = (task) => {
    setSelectedTask({ ...task, source: 'unassigned' });
    setShowDeleteModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setSelectedTask(null);
  };

  const handleCloseDelete = () => {
    setShowDeleteModal(false);
    setSelectedTask(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTask) return;
    try {
      if (selectedTask.source === 'unassigned') {
        await deleteDoc(doc(db, 'unassigned_tasks', selectedTask.id));
        setUnassignedTasks(unassignedTasks.filter(t => t.id !== selectedTask.id));
      } else {
        await deleteDoc(doc(db, 'employee_tasks', selectedTask.id));
        setTasks(tasks.filter(t => t.id !== selectedTask.id));
      }
      handleCloseDelete();
      setSuccessMessage('Task deleted successfully!'); // Show success message
      setTimeout(() => setSuccessMessage(""), 2500); // Hide after 2.5s
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const renderActionButtons = (task, isUnassigned = false) => {
    const isCompleted = task.status === 'completed';
    return (
      <div className="btn-group">
        <button
          className={`btn btn-${isCompleted ? 'secondary' : 'primary'} btn-sm`}
          onClick={() => isUnassigned ? handleEditUnassigned(task) : handleEdit(task)}
          disabled={isCompleted}
          title={isCompleted ? "Completed tasks cannot be edited" : "Edit task"}
        >
          <i className="bi bi-pencil"></i> Edit
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => isUnassigned ? handleDeleteUnassigned(task) : handleDelete(task)}
        >
          <i className="bi bi-trash"></i> Delete
        </button>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container py-4">
        {/* Success Toast/Alert */}
        {successMessage && (
          <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3 shadow" style={{ zIndex: 2000, minWidth: 300, maxWidth: 400 }}>
            <i className="bi bi-check-circle-fill me-2"></i>
            {successMessage}
          </div>
        )}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-0" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: '2.5rem', letterSpacing: '1px', color: '#2c3e50' }}>
              Manage Employee Tasks
            </h1>
          </div>
          <div>
            <button
              className="btn btn-outline-secondary me-2"
              onClick={() => router.back()}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back
            </button>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/admin/tasks/create')}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Create New Task
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-clipboard-x text-muted" style={{ fontSize: '3rem' }}></i>
            <p className="mt-3">No employee tasks found</p>
            <button
              className="btn btn-primary mt-2"
              onClick={() => router.push('/admin/tasks/create')}
            >
              Create Your First Task
            </button>
          </div>
        ) : (
          <div className="row">
            {tasks.map(task => (
              <div key={task.id} className="col-md-6 col-lg-4 mb-4">
                <div className={`card h-100 shadow-sm ${task.status === 'completed' ? 'completed-task' : ''}`}>
                  <div className={`card-header bg-${getPriorityColor(task.priority)}`}>
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0 text-white">{task.title}</h5>
                      {renderActionButtons(task)}
                    </div>
                  </div>
                  <div className="card-body">
                    <p className="card-text">{task.description}</p>
                    <div className="mt-3">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-clock me-2 text-muted"></i>
                        <small>{formatDate(task.deadline)}</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-flag me-2 text-muted"></i>
                        <span className={`badge bg-${getStatusColor(task.status)}`}>
                          {task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Unassigned Tasks Section */}
        <div className="mb-5">
          <h2 className="mb-3" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, color: '#6c757d' }}>
            Unassigned Tasks
          </h2>
          {unassignedTasks.length === 0 ? (
            <div className="text-center py-3">
              <i className="bi bi-clipboard-x text-muted" style={{ fontSize: '2rem' }}></i>
              <p className="mt-2">No unassigned tasks found</p>
            </div>
          ) : (
            <div className="row">
              {unassignedTasks.map(task => (
                <div key={task.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100 shadow-sm">
                    <div className={`card-header bg-${getPriorityColor(task.priority)}`}>
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 text-white">{task.title}</h5>
                        {renderActionButtons(task, true)}
                      </div>
                    </div>
                    <div className="card-body">
                      <p className="card-text">{task.description}</p>
                      <div className="mt-3">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-clock me-2 text-muted"></i>
                          <small>{formatDate(task.deadline)}</small>
                        </div>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-flag me-2 text-muted"></i>
                          <span className={`badge bg-${getStatusColor(task.status)}`}>
                            {task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && selectedTask && (
          <TaskEditModal
            task={selectedTask}
            onClose={handleCloseEdit}
            onSuccess={() => {
              handleCloseEdit();
              fetchTasks();
              fetchUnassignedTasks();
            }}
          />
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedTask && (
          <TaskDeleteModal
            task={selectedTask}
            onClose={handleCloseDelete}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </div>
      <style jsx>{`
        .card {
          border: none;
          transition: transform 0.2s;
        }

        .card:hover {
          transform: translateY(-5px);
        }

        .card-header {
          border-bottom: none;
          border-radius: 10px 10px 0 0;
        }

        .bg-low {
          background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
        }

        .bg-medium {
          background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%);
        }

        .bg-high {
          background: linear-gradient(135deg, #ef5350 0%, #e53935 100%);
        }

        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }

        .btn-group {
          gap: 0.5rem;
        }
        
        .modal {
          background: rgba(0, 0, 0, 0.5);
        }

        .completed-task {
          opacity: 0.8;
          background-color: rgba(40, 167, 69, 0.1);
        }

        .completed-task .card-header {
          opacity: 0.8;
        }

        .completed-task::after {
          content: '✓ Completed';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 1.5rem;
          color: #28a745;
          font-weight: bold;
          opacity: 0.2;
          pointer-events: none;
        }
      `}</style>
    </Layout>
  );
}

function getPriorityColor(priority) {
  switch (priority) {
    case 'high':
      return 'high';
    case 'medium':
      return 'medium';
    case 'low':
      return 'low';
    default:
      return 'medium';
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in-progress':
      return 'info';
    case 'cancelled':
      return 'danger';
    default:
      return 'warning';
  }
}