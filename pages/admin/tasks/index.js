'use client';

import { useRouter } from 'next/router';
import Layout from '../../../components/Layout/layout';

export default function TaskManagement() {
  const router = useRouter();

  return (
    <Layout>
      <div className="container py-4">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/admin/dashboard">Dashboard</a>
            </li>
            <li className="breadcrumb-item active">Task Management</li>
          </ol>
        </nav>

        <div className="row g-3">
          {/* Task Operations Card */}
          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Task Operations</h5>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush">
                  <button 
                    onClick={() => router.push('/admin/tasks/create')}
                    className="list-group-item list-group-item-action d-flex align-items-center"
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Create Task
                  </button>
                  <button 
                    onClick={() => router.push('/admin/tasks/assign')}
                    className="list-group-item list-group-item-action d-flex align-items-center"
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Assign Task
                  </button>
                  <button 
                    onClick={() => router.push('/admin/tasks/edit-delete')}
                    className="list-group-item list-group-item-action d-flex align-items-center"
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    Edit/Delete Tasks
                  </button>
                  <button 
                    onClick={() => router.push('/admin/tasks/status')}
                    className="list-group-item list-group-item-action d-flex align-items-center"
                  >
                    <i className="bi bi-flag me-2"></i>
                    Task Status
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Tasks Card */}
          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-secondary text-white">
                <h5 className="mb-0">Admin Tasks</h5>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush">
                  <button 
                    onClick={() => router.push('/admin/tasks/admin/create')}
                    className="list-group-item list-group-item-action d-flex align-items-center"
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Create Admin Task
                  </button>
                  <button 
                    onClick={() => router.push('/admin/tasks/admin/edit-delete')}
                    className="list-group-item list-group-item-action d-flex align-items-center"
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    Edit/Delete Admin Tasks
                  </button>
                  <button 
                    onClick={() => router.push('/admin/tasks/admin/status')}
                    className="list-group-item list-group-item-action d-flex align-items-center"
                  >
                    <i className="bi bi-flag me-2"></i>
                    Admin Task Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          border-radius: 10px;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        .list-group-item {
          border: none;
          border-bottom: 1px solid rgba(0, 0, 0, 0.125);
          transition: all 0.2s ease;
        }
        
        .list-group-item:last-child {
          border-bottom: none;
        }
        
        .list-group-item:hover {
          background-color: rgba(0, 0, 0, 0.05);
          transform: translateX(5px);
        }
        
        .list-group-item i {
          font-size: 1.2rem;
        }
      `}</style>
    </Layout>
  );
} 