'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../dataconnect/firebase';

export default function EditModal({ task, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'low',
    status: task.status || 'pending',
    deadline: task.deadline?.toDate
      ? task.deadline.toDate().toISOString().slice(0, 16)
      : task.deadline instanceof Date
      ? task.deadline.toISOString().slice(0, 16)
      : '',
    notifications: {
      email: task.notifications?.email || false,
      push: task.notifications?.push || false,
      reminderDays: task.notifications?.reminderDays ?? 1
    }
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('notifications.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [key]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const taskRef = doc(db, 'admin_tasks', task.id);
      const updateData = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline) : null,
        updatedAt: new Date()
      };

      await updateDoc(taskRef, updateData);
      onSuccess();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task. Please try again.');
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show"
        tabIndex="-1"
        style={{ display: 'block', zIndex: 1055 }}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                <i className="bi bi-pencil-square me-2"></i>
                Edit Task
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
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
                        value={formData.priority}
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
                        value={formData.status}
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
                    value={formData.deadline}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Notifications</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="notifications.email"
                      checked={formData.notifications.email}
                      onChange={handleChange}
                      id="notifyEmail"
                    />
                    <label className="form-check-label" htmlFor="notifyEmail">
                      Email Notification
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="notifications.push"
                      checked={formData.notifications.push}
                      onChange={handleChange}
                      id="notifyPush"
                    />
                    <label className="form-check-label" htmlFor="notifyPush">
                      Push Notification
                    </label>
                  </div>
                  <div className="mt-2">
                    <label className="form-label" htmlFor="reminderDays">
                      Reminder Days Before Deadline
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="notifications.reminderDays"
                      id="reminderDays"
                      value={formData.notifications.reminderDays}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                </div>

                <div className="modal-footer px-0 pb-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
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
      </div>
    </>
  );
}
