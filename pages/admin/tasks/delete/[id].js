import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout/Layout';
import Link from 'next/link';

const DeleteTaskPage = ({ task }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Implement the delete logic here
      // This is a placeholder and should be replaced with the actual implementation
      console.log('Deleting task:', task.id);
      // After successful deletion, redirect to user management page
      router.push('/admin/usermanagement');
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-4">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/admin/dashboard/">Dashboard</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/admin/usermanagement">User Management</Link>
            </li>
            <li className="breadcrumb-item active">Delete Task</li>
          </ol>
        </nav>

        <div className="card glassmorphic">
          <div className="card-header bg-gradient text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Delete Task</h5>
            <button 
              className="btn btn-outline-light btn-sm"
              onClick={() => router.push('/admin/usermanagement')}
            >
              Back to User Management
            </button>
          </div>
          <div className="card-body">
            <div className="alert alert-danger mb-4">
              <h6 className="alert-heading mb-2">Warning!</h6>
              <p className="mb-0">Are you sure you want to delete this task? This action cannot be undone.</p>
            </div>
            
            {/* Task details display */}
            {task && (
              <div className="task-details p-4 mb-4 rounded">
                <h6 className="details-heading mb-3">Task Details:</h6>
                <div className="detail-item">
                  <strong>Title:</strong> {task.title}
                </div>
                <div className="detail-item">
                  <strong>Description:</strong> {task.description}
                </div>
                <div className="detail-item">
                  <strong>Assigned To:</strong> {task.assignedToName || task.assignedToEmail || 'Unassigned'}
                </div>
                <div className="detail-item">
                  <strong>Status:</strong> {task.status}
                </div>
              </div>
            )}

            <div className="d-flex justify-content-between mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => router.push('/admin/usermanagement')}
              >
                Back to User Management
              </button>
              <div>
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={() => router.push('/admin/usermanagement')}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Deleting...
                    </>
                  ) : (
                    'Delete Task'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .glassmorphic {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        }
        
        .card {
          border-radius: 15px;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(31, 38, 135, 0.37);
        }
        
        .card-header {
          background: linear-gradient(135deg, #dc3545 0%, #b02a37 100%);
          padding: 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .task-details {
          background: rgba(248, 249, 250, 0.9);
          backdrop-filter: blur(5px);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .details-heading {
          color: #dc3545;
          font-weight: 600;
        }

        .detail-item {
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .detail-item:last-child {
          border-bottom: none;
        }
        
        .btn {
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .btn-danger {
          background: linear-gradient(135deg, #dc3545 0%, #b02a37 100%);
          border: none;
        }
        
        .btn-danger:hover {
          background: linear-gradient(135deg, #b02a37 0%, #842029 100%);
          transform: translateY(-1px);
        }

        .alert-danger {
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.2);
          color: #842029;
        }
      `}</style>
    </Layout>
  );
};

export default DeleteTaskPage; 