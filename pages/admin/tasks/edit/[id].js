import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

const EditTaskPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    // Handle form submission
    setLoading(false);
  };

  return (
    <Layout>
      <div className="container py-4">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/admin/dashboard">Dashboard</a>
            </li>
            <li className="breadcrumb-item">
              <a href="/admin/usermanagement">User Management</a>
            </li>
            <li className="breadcrumb-item active">Edit Task</li>
          </ol>
        </nav>

        <div className="card glassmorphic">
          <div className="card-header bg-gradient text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Edit Task</h5>
            <button 
              className="btn btn-outline-light btn-sm"
              onClick={() => router.push('/admin/usermanagement')}
            >
              Back to User Management
            </button>
          </div>
          <div className="card-body">
            {/* ... rest of the form ... */}
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
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
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
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          padding: 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .btn {
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          border: none;
        }
        
        .btn-primary:hover {
          background: linear-gradient(135deg, #0a58ca 0%, #084298 100%);
          transform: translateY(-1px);
        }
      `}</style>
    </Layout>
  );
};

export default EditTaskPage; 