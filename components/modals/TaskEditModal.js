'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../dataconnect/firebase';

export default function TaskEditModal({ task, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    deadline: task.deadline?.toDate ? task.deadline.toDate().toISOString().slice(0, 16) : '',
    notifications: {
      email: task.notifications?.email || false,
      push: task.notifications?.push || false,
      reminderDays: task.notifications?.reminderDays || 1
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
      const notificationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notificationField]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
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
        deadline: formData.deadline ? Timestamp.fromDate(new Date(formData.deadline)) : null,
        updatedAt: Timestamp.now(),
        progress: task.progress || 0,
        statusNotes: task.statusNotes || ''
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
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Edit Task</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
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

                <div className="card bg-light mb-3">
                  <div className="card-body">
                    <h6 className="mb-3">Notification Settings</h6>
                    <div className="form-check mb-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="notifications.email"
                        checked={formData.notifications.email}
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
                        checked={formData.notifications.push}
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
                          value={formData.notifications.reminderDays}
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