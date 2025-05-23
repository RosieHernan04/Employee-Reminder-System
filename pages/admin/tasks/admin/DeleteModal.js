'use client';

import { useEffect, useState } from 'react';

export default function DeleteModal({ task, onClose, onConfirm }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!isClient) {
    return null;
  }

  const formatDate = (date) => {
    if (!date) return 'No deadline';
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">Confirm Delete</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body text-center">
              <div className="warning-icon-container">
                <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5 className="mb-3">Are you sure you want to delete this task?</h5>
              <p className="text-muted mb-4">This action cannot be undone.</p>

              <div className="task-details p-3 bg-light rounded mb-4">
                <h6 className="mb-2">Task Title:</h6>
                <p className="mb-0 fw-bold">{task.title}</p>
              </div>

              <div className="d-flex justify-content-center gap-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={onConfirm}
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 