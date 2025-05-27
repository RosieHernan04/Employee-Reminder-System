'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from 'components/MainLayout/Layout';
import { collection, query, where, getDocs, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../../../../dataconnect/firebase';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import the modal components with no SSR
const TaskEditModal = dynamic(() => import('../../../../components/modals/TaskEditModal'), { ssr: false });
const TaskDeleteModal = dynamic(() => import('../../../../components/modals/TaskDeleteModal'), { ssr: false });

export default function EditDeleteAdminTasks() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      console.log('Fetching admin tasks...');
      const tasksQuery = query(
        collection(db, 'admin_tasks'),
        orderBy('createdAt', 'desc')
      );
      
      console.log('Executing query...');
      const querySnapshot = await getDocs(tasksQuery);
      console.log('Query completed. Number of tasks:', querySnapshot.size);
      
      const tasksData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Raw task data:', data);
        
        // Convert Firestore timestamps to JavaScript Date objects
        const taskData = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          deadline: data.deadline?.toDate() || null
        };
        
        console.log('Processed task data:', taskData);
        tasksData.push(taskData);
      });
      
      console.log('Final tasks data:', tasksData);
      setTasks(tasksData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
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

  const handleDelete = (task) => {
    setSelectedTask(task);
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
      await deleteDoc(doc(db, 'admin_tasks', selectedTask.id));
      setTasks(tasks.filter(t => t.id !== selectedTask.id));
      handleCloseDelete();
      alert('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const renderActionButtons = (task) => {
    const isCompleted = task.status === 'completed';
    
    return (
      <div className="btn-group">
        <button
          className={`btn btn-${isCompleted ? 'secondary' : 'primary'} btn-sm`}
          onClick={() => handleEdit(task)}
          disabled={isCompleted}
          title={isCompleted ? "Completed tasks cannot be edited" : "Edit task"}
        >
          <i className="bi bi-pencil"></i> Edit
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleDelete(task)}
        >
          <i className="bi bi-trash"></i> Delete
        </button>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-0">Manage Admin Tasks</h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href="/admin/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link href="/admin/usermanagement">Task Management</Link>
                </li>
                <li className="breadcrumb-item active">Edit/Delete Admin Tasks</li>
              </ol>
            </nav>
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
              onClick={() => router.push('/admin/tasks/admin/create')}
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
            <p className="mt-3">No admin tasks found</p>
            <button
              className="btn btn-primary mt-2"
              onClick={() => router.push('/admin/tasks/admin/create')}
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
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedTask && (
          <TaskEditModal
            task={selectedTask}
            onClose={handleCloseEdit}
            onSuccess={() => {
              handleCloseEdit();
              fetchTasks();
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

        .table tr.table-success {
          background-color: rgba(40, 167, 69, 0.1);
        }

        .btn:disabled {
          cursor: not-allowed;
          opacity: 0.6;
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