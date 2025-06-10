'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from 'components/MainLayout/Layout';
import { db } from '../../../lib/firebase.ts';
import { collection, addDoc } from 'firebase/firestore';
import { logAdminActivity, ADMIN_ACTIONS } from '../../../utils/adminLogger';
import { useUser } from '../../../dataconnect/context/UserContext';

export default function CreateTask() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadlineDate: '',
    deadlineTime: '09:00',
    emailNotification: true,
    pushNotification: true,
    reminderDays: 3
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: '', message: '' });

    try {
      const deadline = new Date(formData.deadlineDate + 'T' + formData.deadlineTime);

      // Prevent creating a task if deadline is in the past
      const now = new Date();
      if (
        !formData.deadlineDate ||
        deadline < now ||
        (formData.deadlineDate === now.toISOString().slice(0, 10) && deadline <= now)
      ) {
        setAlert({ type: 'error', message: 'Deadline must be in the future. Please select a valid date and time.' });
        setLoading(false);
        return;
      }

      // Create the task in unassigned_tasks collection
      const taskRef = await addDoc(collection(db, 'unassigned_tasks'), {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        deadline: deadline,
        notifications: {
          email: formData.emailNotification,
          push: formData.pushNotification,
          reminderDays: formData.reminderDays
        },
        status: 'unassigned', // Changed from 'pending' to 'unassigned'
        type: 'employee',
        createdAt: new Date(),
        createdBy: {
          uid: user?.uid,
          name: user?.displayName || user?.email
        },
        progress: 0,
        statusNotes: ''
      });

      // Log the task creation activity
      await logAdminActivity(
        user?.uid,
        user?.displayName || user?.email,
        ADMIN_ACTIONS.TASK_CREATED,
        `Created new unassigned task "${formData.title}"`,
        'Task',
        taskRef.id
      );

      setAlert({ type: 'success', message: 'Task created successfully!' });
      setTimeout(() => router.push('/admin/usermanagement'), 1500); // Redirect after short delay
    } catch (error) {
      console.error('Error creating task:', error);
      setAlert({ type: 'error', message: 'Error creating task. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-success text-white border-0 rounded-top-4">
                <h2 className="text-center mb-2">Create Task for Employee</h2>
                <p className="text-center mb-0 opacity-75">
                  Fill in the fields to create a new task for employee.
                </p>
              </div>
              <div className="card-body p-4">
                {/* Custom Alert */}
                {alert.message && (
                  <div
                    className={`alert alert-${alert.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}
                    role="alert"
                  >
                    {alert.message}
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={() => setAlert({ type: '', message: '' })}
                      style={{ float: 'right', border: 'none', background: 'none' }}
                    ></button>
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label h5 mb-3">Task Title</label>
                    <input
                      type="text"
                      className="form-control form-control-lg bg-light border-0"
                      placeholder="Enter task title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label h5 mb-3">Description</label>
                    <textarea
                      className="form-control form-control-lg bg-light border-0"
                      placeholder="Enter task description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="3"
                      required
                    />
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label h5 mb-3">Priority Level</label>
                      <select
                        className="form-select form-select-lg bg-light border-0"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        required
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label h5 mb-3">Deadline Date</label>
                      <input
                        type="date"
                        className="form-control form-control-lg bg-light border-0"
                        value={formData.deadlineDate}
                        onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label h5 mb-3">Reminder Time</label>
                      <input
                        type="time"
                        className="form-control form-control-lg bg-light border-0"
                        value={formData.deadlineTime}
                        onChange={(e) => setFormData({ ...formData, deadlineTime: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label h5 mb-3">Reminder Days Before</label>
                      <input
                        type="number"
                        className="form-control form-control-lg bg-light border-0"
                        value={formData.reminderDays}
                        onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) })}
                        min="1"
                        max="30"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label h5 mb-3">Notification Settings</label>
                    <div className="bg-light p-3 rounded-3">
                      <div className="form-check mb-3">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="emailNotification"
                          checked={formData.emailNotification}
                          onChange={(e) => setFormData({ ...formData, emailNotification: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="emailNotification">
                          Email Notifications
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="pushNotification"
                          checked={formData.pushNotification}
                          onChange={(e) => setFormData({ ...formData, pushNotification: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="pushNotification">
                          Push Notifications
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-5">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-lg px-4"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg px-5"
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Create Task'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .form-control, .form-select {
          padding: 0.75rem 1rem;
          font-size: 1rem;
          border-radius: 12px;
          transition: all 0.2s;
        }
        
        .form-control:focus, .form-select:focus {
          box-shadow: 0 0 0 0.25rem rgba(40, 167, 69, 0.25);
          border-color: #28a745;
        }
        
        .form-check-input:checked {
          background-color: #28a745;
          border-color: #28a745;
        }
        
        .btn {
          border-radius: 12px;
          padding: 0.75rem 1.5rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .btn-primary {
          background-color: #0d6efd;
          border: none;
        }
        
        .btn-primary:hover {
          background-color: #0b5ed7;
          transform: translateY(-1px);
        }
        
        .card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
        }
        
        .bg-light {
          background-color: rgba(248, 249, 250, 0.8) !important;
        }
      `}</style>
    </Layout>
  );
}