'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../dataconnect/firebase';

export default function CreateTaskForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: '',
    status: 'pending',
    type: 'employee',
    assignedTo: '',
    department: '',
    category: '',
    estimatedHours: '',
    notifications: {
      email: true,
      push: true,
      reminderDays: 3
    }
  });

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
      const taskData = {
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
        deadline: formData.deadline ? new Date(formData.deadline) : null,
        assignedTo: formData.assignedTo || null,
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null
      };
      
      // Determine the collection based on the task type
      let collectionName;
      if (formData.type === 'admin') {
        collectionName = 'admin_tasks';
      } else if (formData.type === 'employee') {
        collectionName = 'employee_tasks';
      } else {
        collectionName = 'tasks';
      }
      
      await addDoc(collection(db, collectionName), taskData);
      onSuccess();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task. Please try again.');
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content shadow-lg">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Create New Task</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Task Title"
                    />
                    <label>Task Title</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating">
                    <select
                      className="form-select"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      required
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    <label>Priority</label>
                  </div>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      required
                    />
                    <label>Deadline</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="number"
                      className="form-control"
                      name="estimatedHours"
                      value={formData.estimatedHours}
                      onChange={handleChange}
                      min="1"
                      placeholder="Estimated Hours"
                    />
                    <label>Estimated Hours</label>
                  </div>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="form-floating">
                    <select
                      className="form-select"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="IT">IT Department</option>
                      <option value="HR">HR Department</option>
                      <option value="Finance">Finance Department</option>
                      <option value="Marketing">Marketing Department</option>
                    </select>
                    <label>Department</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating">
                    <select
                      className="form-select"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Development">Development</option>
                      <option value="Design">Design</option>
                      <option value="Documentation">Documentation</option>
                      <option value="Testing">Testing</option>
                    </select>
                    <label>Category</label>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="form-floating">
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    style={{ height: '100px' }}
                    required
                    placeholder="Task Description"
                  />
                  <label>Task Description</label>
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h6 className="mb-0">Notification Settings</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-check form-switch mb-3">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          name="notifications.email"
                          checked={formData.notifications.email}
                          onChange={handleChange}
                          id="emailNotif"
                        />
                        <label className="form-check-label" htmlFor="emailNotif">
                          Email Notifications
                        </label>
                      </div>
                      <div className="form-check form-switch mb-3">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          name="notifications.push"
                          checked={formData.notifications.push}
                          onChange={handleChange}
                          id="pushNotif"
                        />
                        <label className="form-check-label" htmlFor="pushNotif">
                          Push Notifications
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="number"
                          className="form-control"
                          name="notifications.reminderDays"
                          value={formData.notifications.reminderDays}
                          onChange={handleChange}
                          min="1"
                          max="30"
                        />
                        <label>Reminder Days Before Deadline</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .floating-form {
          max-width: 100%;
          margin: 0 auto;
        }

        .floating-label {
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          transition: 0.2s ease all;
          color: #6c757d;
        }

        .form-control:focus ~ .floating-label,
        .form-control:not(:placeholder-shown) ~ .floating-label {
          transform: translateY(-1.5rem) scale(0.85);
          color: #0d6efd;
        }

        .form-control {
          background: transparent;
          transition: border-color 0.2s ease;
        }

        .form-control:focus {
          box-shadow: none;
          border-color: #0d6efd;
        }

        .form-floating > .form-control:focus ~ label,
        .form-floating > .form-control:not(:placeholder-shown) ~ label {
          color: #0d6efd;
        }

        .card {
          border-radius: 15px;
          border: none;
        }

        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
      `}</style>
    </div>
  );
} 