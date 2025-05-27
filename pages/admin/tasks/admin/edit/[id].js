import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from 'components/MainLayout/Layout';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../../dataconnect/firebase';
import Link from 'next/link';

export default function EditAdminTask() {
  const router = useRouter();
  const { id } = router.query;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchTask = async () => {
    try {
      const taskDoc = await getDoc(doc(db, 'admin_tasks', id));
      if (taskDoc.exists()) {
        const data = taskDoc.data();
        setTask({
          id: taskDoc.id,
          ...data,
          deadline: data.deadline?.toDate().toISOString().slice(0, 16)
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching task:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('notifications.')) {
      const notificationField = name.split('.')[1];
      setTask(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notificationField]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setTask(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const taskRef = doc(db, 'admin_tasks', id);
      const updateData = {
        ...task,
        deadline: new Date(task.deadline),
        updatedAt: new Date()
      };
      
      await updateDoc(taskRef, updateData);
      alert('Task updated successfully!');
      router.push('/admin/tasks/admin/edit-delete');
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task. Please try again.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-4">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <div className="container py-4">
          <div className="alert alert-danger">Task not found.</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-0">Edit Admin Task</h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href="/admin/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link href="/admin/tasks/admin/edit-delete">Manage Admin Tasks</Link>
                </li>
                <li className="breadcrumb-item active">Edit Task</li>
              </ol>
            </nav>
          </div>
          <button
            className="btn btn-outline-secondary"
            onClick={() => router.back()}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back
          </button>
        </div>

        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={task.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={task.description}
                  onChange={handleChange}
                  rows="3"
                  required
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      name="priority"
                      value={task.priority}
                      onChange={handleChange}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      name="status"
                      value={task.status}
                      onChange={handleChange}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Deadline</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  name="deadline"
                  value={task.deadline}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="card bg-light mb-3">
                <div className="card-body">
                  <h6 className="mb-3">Notification Settings</h6>
                  <div className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="notifications.email"
                      checked={task.notifications?.email}
                      onChange={handleChange}
                      id="emailNotif"
                    />
                    <label className="form-check-label" htmlFor="emailNotif">
                      <i className="bi bi-envelope me-2"></i>Email Notifications
                    </label>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="notifications.push"
                      checked={task.notifications?.push}
                      onChange={handleChange}
                      id="pushNotif"
                    />
                    <label className="form-check-label" htmlFor="pushNotif">
                      <i className="bi bi-bell me-2"></i>Push Notifications
                    </label>
                  </div>
                  <div>
                    <label className="form-label">Remind me before deadline</label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        name="notifications.reminderDays"
                        value={task.notifications?.reminderDays}
                        onChange={handleChange}
                        min="1"
                        max="30"
                      />
                      <span className="input-group-text">days</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => router.back()}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
} 