'use client';

import { useEffect } from 'react';

export default function TaskDeleteModal({ task, onClose, onConfirm }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

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
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1050 }}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">Delete Task</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="text-center mb-4">
                <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
                <h2 className="mt-3">Delete Confirmation</h2>
                <p className="text-muted">Are you sure you want to delete this task?</p>
              </div>

              <div className="card bg-light mb-4">
                <div className="card-body">
                  <h5 className="card-title">{task.title}</h5>
                  <p className="card-text">{task.description}</p>
                  <div className="d-flex justify-content-between text-muted">
                    <span>
                      <i className="bi bi-clock me-2"></i>
                      {formatDate(task.deadline)}
                    </span>
                    <span>
                      <i className="bi bi-flag me-2"></i>
                      Priority: {task.priority}
                    </span>
                  </div>
                </div>
              </div>

              <div className="alert alert-warning">
                <i className="bi bi-exclamation-circle me-2"></i>
                This action cannot be undone. The task will be permanently deleted.
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
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