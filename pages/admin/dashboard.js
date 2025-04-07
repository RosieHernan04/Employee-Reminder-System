import AdminLayout from '../../components/layout/AdminLayout';

export default function Dashboard() {
  return (
    <AdminLayout>
      <div>
        <h1 className="mb-4">Dashboard</h1>
        
        {/* Stats Cards Row */}
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white h-100">
              <div className="card-body">
                <h5 className="card-title">Pending Tasks</h5>
                <p className="display-4">12</p>
                <p className="card-text">Tasks awaiting completion</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="card bg-success text-white h-100">
              <div className="card-body">
                <h5 className="card-title">Incoming Meetings</h5>
                <p className="display-4">5</p>
                <p className="card-text">Meetings scheduled this week</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="card bg-warning text-dark h-100">
              <div className="card-body">
                <h5 className="card-title">Total Registered Users</h5>
                <p className="display-4">150</p>
                <p className="card-text">Total users in the system</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="card bg-danger text-white h-100">
              <div className="card-body">
                <h5 className="card-title">Total Completed Tasks</h5>
                <p className="display-4">110</p>
                <p className="card-text">Tasks completed so far</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity and Reports Section */}
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="card-title mb-0">Recent User Activity</h5>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush">
                  <div className="list-group-item">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-person-circle me-3 fs-4"></i>
                      <div>
                        <p className="mb-1">User JohnDoe logged in</p>
                        <small className="text-muted">2 minutes ago</small>
                      </div>
                    </div>
                  </div>
                  <div className="list-group-item">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-pencil-square me-3 fs-4"></i>
                      <div>
                        <p className="mb-1">User JaneSmith updated their profile</p>
                        <small className="text-muted">15 minutes ago</small>
                      </div>
                    </div>
                  </div>
                  <div className="list-group-item">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-plus-circle me-3 fs-4"></i>
                      <div>
                        <p className="mb-1">User MichaelBay created a new post</p>
                        <small className="text-muted">1 hour ago</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="card-title mb-0">Latest Reports</h5>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush">
                  <div className="list-group-item">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-file-text me-3 fs-4"></i>
                      <div>
                        <p className="mb-1">Report ID: #1023 - User Engagement</p>
                        <small className="text-muted">Generated today</small>
                      </div>
                    </div>
                  </div>
                  <div className="list-group-item">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-file-text me-3 fs-4"></i>
                      <div>
                        <p className="mb-1">Report ID: #1024 - System Performance</p>
                        <small className="text-muted">Generated yesterday</small>
                      </div>
                    </div>
                  </div>
                  <div className="list-group-item">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-file-text me-3 fs-4"></i>
                      <div>
                        <p className="mb-1">Report ID: #1025 - Monthly Financials</p>
                        <small className="text-muted">Generated 2 days ago</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
