import AdminLayout from '../../components/layout/AdminLayout';

export default function UserManagement() {
  return (
    <AdminLayout>
      <div>
        {/* Enhanced Title Styling */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h1 className="display-4 fw-bold text-primary mb-0">
            User Management
            <div className="title-underline bg-primary mt-2"></div>
          </h1>
        </div>

        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/admin/dashboard">Dashboard</a>
            </li>
            <li className="breadcrumb-item active">User Management</li>
          </ol>
        </nav>

        {/* Management Cards */}
        <div className="row g-3">
          {/* Manage Tasks Card */}
          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Manage Tasks</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  <button onClick={() => console.log('Create Task clicked')} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <i className="bi bi-plus-circle me-3"></i>
                    <span>Create Task</span>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                  <button onClick={() => console.log('Assign Task clicked')} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <i className="bi bi-person-check me-3"></i>
                    <span>Assign Task</span>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                  <button onClick={() => console.log('Edit/Delete Tasks clicked')} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <i className="bi bi-pencil me-3"></i>
                    <span>Edit/Delete Tasks</span>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                  <button onClick={() => console.log('Set Task Status clicked')} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <i className="bi bi-flag me-3"></i>
                    <span>Set Task Status</span>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Manage Meetings Card */}
          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">Manage Meetings</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  <button onClick={() => console.log('Schedule Meeting clicked')} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <i className="bi bi-calendar-plus me-3"></i>
                    <span>Schedule Meeting</span>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                  <button onClick={() => console.log('Invite Employees clicked')} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <i className="bi bi-people me-3"></i>
                    <span>Invite Employees</span>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                  <button onClick={() => console.log('Set Meeting Status clicked')} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <i className="bi bi-check-circle me-3"></i>
                    <span>Set Meeting Status</span>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                  <button onClick={() => console.log('Send Meeting Reminders clicked')} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <i className="bi bi-bell me-3"></i>
                    <span>Send Meeting Reminders</span>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Manage Deadlines Card */}
          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">Manage Deadlines</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  <button onClick={() => console.log('Set Deadlines clicked')} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <i className="bi bi-calendar-event me-3"></i>
                    <span>Set Deadlines</span>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                  <button onClick={() => console.log('Deadline Notifications clicked')} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <i className="bi bi-bell-fill me-3"></i>
                    <span>Deadline Notifications</span>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                  <button onClick={() => console.log('Track Deadline Progress clicked')} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <i className="bi bi-graph-up me-3"></i>
                    <span>Track Deadline Progress</span>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Management Sections */}
        <div className="row g-3 mt-4">
          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">Employee Notifications</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  <button onClick={() => console.log('Send Email Notification clicked')} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <i className="bi bi-envelope me-3"></i>
                    <span>Send Email Notification</span>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                  <button onClick={() => console.log('Push Notification Settings clicked')} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <i className="bi bi-app-indicator me-3"></i>
                    <span>Push Notification Settings</span>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                  <button onClick={() => console.log('Reminder Settings clicked')} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <i className="bi bi-gear me-3"></i>
                    <span>Reminder Settings</span>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-danger text-white">
                <h5 className="mb-0">Assign Tasks to Admin</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  <button onClick={() => console.log('Create Admin Task clicked')} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <i className="bi bi-plus-square me-3"></i>
                    <span>Create Admin Task</span>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                  <button onClick={() => console.log('Manage Admin Task Status clicked')} 
                          className="list-group-item-action d-flex align-items-center p-3 action-button">
                    <i className="bi bi-list-check me-3"></i>
                    <span>Manage Admin Task Status</span>
                    <i className="bi bi-chevron-right ms-auto"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-4 text-center text-muted">
          <p>© 2025 ADECMPC. All Rights Reserved.</p>
        </footer>

        <style jsx>{`
          .title-underline {
            height: 4px;
            width: 60px;
            border-radius: 2px;
          }

          .action-button {
            border: none;
            background: none;
            width: 100%;
            text-align: left;
            transition: all 0.3s ease;
            border-left: 4px solid transparent;
            text-decoration: none;
            color: #333;
          }

          .action-button:hover {
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
            padding-left: 1.25rem !important;
            color: #007bff;
          }

          .action-button:hover i {
            transform: scale(1.1);
          }

          .action-button i {
            transition: all 0.3s ease;
          }

          .action-button .bi-chevron-right {
            opacity: 0;
            transition: all 0.3s ease;
          }

          .action-button:hover .bi-chevron-right {
            opacity: 1;
            transform: translateX(5px);
          }

          /* Add smooth transitions for cards */
          .card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
          }

          /* Enhanced card headers */
          .card-header {
            border-bottom: none;
            padding: 1rem;
            font-weight: 600;
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}
