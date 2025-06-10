'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from 'components/MainLayout/Layout';
import { db } from '../../../../lib/firebase.ts';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // <-- ADD THIS

export default function CreateAdminTask() {
  const router = useRouter();
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
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user found.');
      }

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

      const deadlineTimestamp = Timestamp.fromDate(deadline);

      const taskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        deadline: deadlineTimestamp,
        notifications: {
          email: formData.emailNotification,
          push: formData.pushNotification,
          reminderDays: formData.reminderDays
        },
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        type: 'admin',
        userId: currentUser.uid, // ✅ ADD admin UID
        createdBy: {
          email: currentUser.email || ''
        }
      };

      await addDoc(collection(db, 'admin_tasks'), taskData);

      setAlert({ type: 'success', message: 'Task created successfully!' });
      setTimeout(() => router.push('/admin/usermanagement'), 1500); // Redirect after short delay
    } catch (error) {
      console.error('Error creating task:', error);
      setAlert({ type: 'error', message: 'Error creating task. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/admin/usermanagement');
  };

  return (
    <Layout>
      <div className="container py-4">
        <div className="form-container">
          <div className="form-card">
            <div className="form-header">
              <button onClick={handleBack} className="back-button">
                <i className="bi bi-arrow-left"></i> Back
              </button>
              <h1>Create Admin Task</h1>
              <p>Fill in the fields to create a new administrative task.</p>
            </div>

            {/* Custom Alert */}
            {alert.message && (
              <div
                className={`alert alert-${alert.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}
                role="alert"
                style={{ margin: "1rem 2rem 0 2rem" }}
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
              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Enter task description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    required
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Deadline Date</label>
                  <input
                    type="date"
                    value={formData.deadlineDate}
                    onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Reminder Time</label>
                  <input
                    type="time"
                    value={formData.deadlineTime}
                    onChange={(e) => setFormData({ ...formData, deadlineTime: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Reminder Days Before</label>
                  <input
                    type="number"
                    value={formData.reminderDays}
                    onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) })}
                    min="1"
                    max="30"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notification Settings</label>
                <div className="notification-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.emailNotification}
                      onChange={(e) => setFormData({ ...formData, emailNotification: e.target.checked })}
                    />
                    <span className="checkbox-custom"></span>
                    Email Notifications
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.pushNotification}
                      onChange={(e) => setFormData({ ...formData, pushNotification: e.target.checked })}
                    />
                    <span className="checkbox-custom"></span>
                    Push Notifications
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="create-button" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .form-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .form-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .form-header {
          background: #28a745;
          color: white;
          padding: 2rem;
          text-align: center;
          position: relative;
        }

        .back-button {
          position: absolute;
          left: 1rem;
          top: 1rem;
          background: transparent;
          border: 2px solid white;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(-3px);
        }

        .form-header h1 {
          margin: 0;
          font-size: 2rem;
          font-weight: 500;
        }

        .form-header p {
          margin: 10px 0 0;
          opacity: 0.9;
        }

        form {
          padding: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }

        input, select, textarea {
          width: 100%;
          padding: 0.75rem;
          border: none;
          border-radius: 10px;
          background: rgba(248, 249, 250, 0.8);
          font-size: 1rem;
          transition: all 0.2s;
        }

        input:focus, select:focus, textarea:focus {
          outline: none;
          background: rgba(248, 249, 250, 0.95);
          box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.2);
        }

        .notification-options {
          background: rgba(248, 249, 250, 0.8);
          padding: 1rem;
          border-radius: 10px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
          cursor: pointer;
        }

        .checkbox-label input {
          width: auto;
          margin-right: 0.5rem;
        }

        .checkbox-custom {
          width: 20px;
          height: 20px;
          border: 2px solid #28a745;
          border-radius: 4px;
          margin-right: 8px;
          position: relative;
        }

        .checkbox-label input:checked + .checkbox-custom::after {
          content: '';
          position: absolute;
          left: 6px;
          top: 2px;
          width: 4px;
          height: 8px;
          border: solid #28a745;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .form-actions {
          margin-top: 2rem;
          text-align: right;
        }

        .create-button {
          background: #0d6efd;
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .create-button:hover {
          background: #0b5ed7;
          transform: translateY(-1px);
        }

        .create-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .back-button {
            position: relative;
            left: 0;
            top: 0;
            margin-bottom: 1rem;
            width: 100%;
            justify-content: center;
          }

          .form-header {
            text-align: center;
            padding-top: 1rem;
          }
        }
      `}</style>
    </Layout>
  );
}