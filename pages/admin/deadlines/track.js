import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from 'components/MainLayout/Layout';
import { db } from '../../../lib/firebase.ts';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';

export default function TrackDeadlines() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deadlines, setDeadlines] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    let unsubscribeEmployeeTasks = null;
    let unsubscribeAdminTasks = null;
    let unsubscribeMeetings = null;

    try {
      // Real-time listener for employee tasks (assigned by admin)
      const employeeTasksQuery = query(
        collection(db, 'employee_tasks'),
        orderBy('deadline', 'desc')
      );
      unsubscribeEmployeeTasks = onSnapshot(employeeTasksQuery, snapshot => {
        const employeeTasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          deadline: doc.data().deadline?.toDate() || new Date(),
          type: 'assigned',
          source: 'employee_tasks',
          collection: 'employee_tasks',
          status: doc.data().status || 'assigned' // Default to 'assigned' if missing
        }));
        updateTasks(employeeTasks, null, null);
      });

      // Real-time listener for admin tasks
      const adminTasksQuery = query(
        collection(db, 'admin_tasks'),
        orderBy('deadline', 'desc')
      );
      unsubscribeAdminTasks = onSnapshot(adminTasksQuery, snapshot => {
        const adminTasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          deadline: doc.data().deadline?.toDate() || new Date(),
          type: 'personal',
          source: 'admin_tasks',
          collection: 'admin_tasks',
          status: doc.data().status || 'pending'
        }));
        updateTasks(null, adminTasks, null);
      });

      // Real-time listener for meetings
      const meetingsQuery = query(
        collection(db, 'meetings'),
        orderBy('start', 'desc') // Use 'start' field for meetings
      );
      unsubscribeMeetings = onSnapshot(meetingsQuery, snapshot => {
        const meetings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          deadline: doc.data().start?.toDate() || new Date(),
          type: 'meeting',
          source: 'meetings',
          collection: 'meetings',
          status: doc.data().status || 'pending'
        }));
        updateTasks(null, null, meetings);
      });

      // Helper to combine and filter tasks
      let latestEmployeeTasks = [];
      let latestAdminTasks = [];
      let latestMeetings = [];

      function updateTasks(employeeTasks, adminTasks, meetings) {
        if (employeeTasks !== null) latestEmployeeTasks = employeeTasks;
        if (adminTasks !== null) latestAdminTasks = adminTasks;
        if (meetings !== null) latestMeetings = meetings;

        // Combine all tasks and filter out any that don't exist in Firestore
        const allTasks = [...latestEmployeeTasks, ...latestAdminTasks, ...latestMeetings]
          .filter(task => {
            return task && 
                   task.id && 
                   task.collection && 
                   ['employee_tasks', 'admin_tasks', 'meetings'].includes(task.collection);
          })
          .sort((a, b) => b.deadline - a.deadline);

        let filteredTasks = allTasks;
        if (filter !== 'all') {
          filteredTasks = allTasks.filter(task => {
            const isOverdue = task.deadline < new Date();
            // Pending includes both 'pending' and 'assigned'
            const isPending = task.status === 'pending' || task.status === 'assigned';
            switch (filter) {
              case 'pending':
                return isPending && !isOverdue;
              case 'completed':
                return task.status === 'completed';
              case 'overdue':
                return isPending && isOverdue;
              default:
                return true;
            }
          });
        }
        setDeadlines(filteredTasks);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }

    // Cleanup listeners on unmount
    return () => {
      if (unsubscribeEmployeeTasks) unsubscribeEmployeeTasks();
      if (unsubscribeAdminTasks) unsubscribeAdminTasks();
      if (unsubscribeMeetings) unsubscribeMeetings();
    };
  }, [filter]);

  const filteredDeadlines = deadlines.filter(deadline => {
    const matchesSearch = deadline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deadline.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <Layout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-primary">
            <i className="bi bi-graph-up me-2"></i>
            Track Deadlines
          </h1>
          <button
            className="btn btn-outline-primary"
            onClick={() => router.push('/admin/meetingmanagement')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back
          </button>
        </div>

        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-clock me-2"></i>
                  Pending
                </h5>
                <h2 className="mb-0">
                  {
                    deadlines.filter(
                      d => (d.status === 'pending' || d.status === 'assigned') && d.deadline > new Date()
                    ).length
                  }
                </h2>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-success text-white">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-check-circle me-2"></i>
                  Completed
                </h5>
                <h2 className="mb-0">
                  {deadlines.filter(d => d.status === 'completed').length}
                </h2>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-danger text-white">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Overdue
                </h5>
                <h2 className="mb-0">
                  {deadlines.filter(d => (d.status === 'pending' || d.status === 'assigned') && d.deadline < new Date()).length}
                </h2>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-list-check me-2"></i>
              Deadline Tracking
            </h5>
          </div>
          <div className="card-body">
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search deadlines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <select
                  className="form-select"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Deadlines</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-3">Loading deadlines...</p>
              </div>
            ) : filteredDeadlines.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
                <p className="text-muted mt-3">No deadlines found</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Deadline</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Type</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeadlines.map(deadline => (
                      <tr key={deadline.id}>
                        <td>{deadline.title}</td>
                        <td>{deadline.description}</td>
                        <td>{deadline.deadline.toLocaleDateString()}</td>
                        <td>
                          <span className={`badge bg-${getPriorityClass(deadline.priority)}`}>
                            {deadline.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`badge bg-${getStatusClass(deadline.status)}`}>
                            {deadline.status}
                          </span>
                        </td>
                        <td>
                          <span className={`badge bg-${deadline.type === 'assigned' ? 'info' : 'success'}`}>
                            {deadline.type}
                          </span>
                        </td>
                        <td>
                          <span className={`badge bg-${deadline.source === 'admin_tasks' ? 'primary' : 'secondary'}`}>
                            {deadline.source}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          border: none;
          border-radius: 10px;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        }
        .card-header {
          border-radius: 10px 10px 0 0 !important;
          padding: 1rem;
        }
        .table th {
          font-weight: 600;
          background-color: #f8f9fa;
          padding: 1rem;
        }
        .table td {
          padding: 1rem;
        }
        .badge {
          font-weight: 500;
          padding: 0.5em 0.7em;
        }
        .input-group-text {
          background-color: #f8f9fa;
          border-right: none;
        }
        .input-group .form-control {
          border-left: none;
        }
        .input-group .form-control:focus {
          border-color: #ced4da;
          box-shadow: none;
        }
        .btn {
          padding: 0.5rem 1rem;
          font-weight: 500;
        }
        .btn-primary {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
        .btn-primary:hover {
          background-color: #0b5ed7;
          border-color: #0a58ca;
        }
      `}</style>
    </Layout>
  );
}

function getPriorityClass(priority) {
  switch (priority) {
    case 'high':
      return 'danger';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'secondary';
  }
}

function getStatusClass(status) {
  switch (status) {
    case 'pending':
      return 'primary';
    case 'completed':
      return 'success';
    case 'overdue':
      return 'danger';
    case 'assigned':
      return 'info';
    default:
      return 'secondary';
  }
}