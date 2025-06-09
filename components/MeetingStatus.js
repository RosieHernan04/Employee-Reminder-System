import { useState } from 'react';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from 'lib/firebase';

export default function MeetingStatus({ meeting, onStatusChange, isAdmin = false }) {
  const [loading, setLoading] = useState(false);

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-success';
      case 'in-progress':
        return 'bg-warning text-dark';
      case 'cancelled':
        return 'bg-danger';
      case 'scheduled':
      default:
        return 'bg-primary';
    }
  };

  const handleMarkAsCompleted = async () => {
    if (meeting.status === 'completed') {
      const infoMessage = document.createElement('div');
      infoMessage.className = 'alert alert-info alert-dismissible fade show position-fixed top-0 end-0 m-3';
      infoMessage.innerHTML = `
        <strong>Info:</strong> This meeting is already marked as completed.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      document.body.appendChild(infoMessage);
      setTimeout(() => infoMessage.remove(), 3000);
      return;
    }

    if (!window.confirm('Are you sure you want to mark this meeting as completed?')) {
      const warnMessage = document.createElement('div');
      warnMessage.className = 'alert alert-warning alert-dismissible fade show position-fixed top-0 end-0 m-3';
      warnMessage.innerHTML = `
        <strong>Cancelled:</strong> Status update was cancelled.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      document.body.appendChild(warnMessage);
      setTimeout(() => warnMessage.remove(), 2500);
      return;
    }

    try {
      setLoading(true);

      await updateDoc(doc(db, 'meetings', meeting.id), {
        status: 'completed',
        completedBy: 'admin',
        completedAt: Timestamp.now()
      });

      if (onStatusChange) {
        onStatusChange('completed');
      }

      const successMessage = document.createElement('div');
      successMessage.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
      successMessage.innerHTML = `
        <strong>Success!</strong> Meeting marked as completed.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      document.body.appendChild(successMessage);

      setTimeout(() => successMessage.remove(), 3000);

    } catch (error) {
      console.error('Error updating meeting status:', error);

      let errorText = 'Failed to update meeting status.';
      if (error.code === 'permission-denied') {
        errorText = 'You do not have permission to update this meeting.';
      } else if (error.code === 'not-found' || error.message?.includes('No document to update')) {
        errorText = 'Meeting not found. It may have been deleted.';
      } else if (error.message) {
        errorText = error.message;
      }

      const errorMessage = document.createElement('div');
      errorMessage.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3';
      errorMessage.innerHTML = `
        <strong>Error!</strong> ${errorText}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      document.body.appendChild(errorMessage);

      setTimeout(() => errorMessage.remove(), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex gap-2 align-items-center">
      {meeting.status !== 'completed' && isAdmin ? (
        <button
          className="btn btn-success btn-sm"
          onClick={handleMarkAsCompleted}
          disabled={loading}
        >
          <i className="bi bi-check-circle me-1"></i>
          Mark Complete
        </button>
      ) : (
        <span className={`badge ${getStatusBadgeClass(meeting.status)} d-flex align-items-center`}>
          <i className={`bi bi-${meeting.status === 'completed' ? 'check-circle-fill' : 'clock'} me-1`}></i>
          {meeting.status?.charAt(0).toUpperCase() + meeting.status?.slice(1) || 'Scheduled'}
          {meeting.status === 'completed' && meeting.completedAt && (
            <small className="ms-1">
              ({meeting.completedAt instanceof Date ? 
                meeting.completedAt.toLocaleDateString() : 
                new Date(meeting.completedAt.seconds * 1000).toLocaleDateString()})
            </small>
          )}
        </span>
      )}

      <style jsx>{`
        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .badge {
          font-size: 0.85rem;
          padding: 0.5em 0.7em;
        }

        .alert {
          z-index: 1050;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}