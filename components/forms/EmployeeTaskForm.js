'use client';

import { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../dataconnect/firebase';

export default function EmployeeTaskForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: '',
    deadlineTime: '09:00',
    status: 'pending',
    type: 'employee',
    notifications: {
      email: true,
      push: true,
      reminderDays: 3
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    setLoading(true);
    setError('');

    try {
      // Combine date and time for deadline
      const deadlineDate = new Date(formData.deadline);
      const [hours, minutes] = formData.deadlineTime.split(':');
      deadlineDate.setHours(parseInt(hours), parseInt(minutes), 0);

      const taskData = {
        ...formData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        deadline: Timestamp.fromDate(deadlineDate),
        status: 'pending',
        progress: 0,
        assignedEmployees: [] // Will be populated when task is assigned
      };

      // Remove the separate time field before saving
      delete taskData.deadlineTime;

      await addDoc(collection(db, 'employee_tasks'), taskData);
      onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Error creating task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="title" className="form-label">Task Title</label>
        <input
          type="text"
          className="form-control"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label">Description</label>
        <textarea
          className="form-control"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          required
        />
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="priority" className="form-label">Priority</label>
          <select
            className="form-select"
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="col-md-6">
          <label htmlFor="deadline" className="form-label">Deadline Date</label>
          <input
            type="date"
            className="form-control"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="deadlineTime" className="form-label">Deadline Time</label>
        <input
          type="time"
          className="form-control"
          id="deadlineTime"
          name="deadlineTime"
          value={formData.deadlineTime}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Notifications</label>
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="emailNotification"
            name="notifications.email"
            checked={formData.notifications.email}
            onChange={handleChange}
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
            name="notifications.push"
            checked={formData.notifications.push}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="pushNotification">
            Push Notifications
          </label>
        </div>
        <div className="mt-2">
          <label htmlFor="reminderDays" className="form-label">Reminder Days Before Deadline</label>
          <input
            type="number"
            className="form-control"
            id="reminderDays"
            name="notifications.reminderDays"
            value={formData.notifications.reminderDays}
            onChange={handleChange}
            min="1"
            max="30"
          />
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </div>
    </form>
  );
} 