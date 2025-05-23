import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/layout';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import RecentActivityFeed from '../../components/dashboard/RecentActivityFeed';
import { fetchDashboardData } from '../../lib/fetchDashboardData';

export default function Dashboard() {
  const [stats, setStats] = useState({
    pendingTasks: 0,
    incomingMeetings: 0,
    totalUsers: 0,
    completedTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchDashboardData();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Set up real-time listeners
    const unsubscribers = [];

    // Listen for employee tasks
    const unsubscribeEmployeeTasks = onSnapshot(
      query(collection(db, 'employee_tasks')),
      () => fetchData()
    );
    unsubscribers.push(unsubscribeEmployeeTasks);

    // Listen for admin tasks
    const unsubscribeAdminTasks = onSnapshot(
      query(collection(db, 'admin_tasks')),
      () => fetchData()
    );
    unsubscribers.push(unsubscribeAdminTasks);

    // Listen for meetings with proper query
    const unsubscribeMeetings = onSnapshot(
      query(
        collection(db, 'meetings'),
        where('status', 'in', ['scheduled', 'pending'])
      ),
      () => fetchData()
    );
    unsubscribers.push(unsubscribeMeetings);

    // Listen for users
    const unsubscribeUsers = onSnapshot(
      query(collection(db, 'users')),
      () => fetchData()
    );
    unsubscribers.push(unsubscribeUsers);

    setLoading(false);

    // Cleanup listeners
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        {/* Enhanced Title Styling */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h1 className="display-4 fw-bold text-primary mb-0">
            Dashboard
            <div className="title-underline bg-primary mt-2"></div>
          </h1>
        </div>
        
        {/* Stats Cards Row */}
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white h-100">
              <div className="card-body">
                <h5 className="card-title">Pending Tasks</h5>
                <p className="display-4">{stats.pendingTasks}</p>
                <p className="card-text">Tasks awaiting completion</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="card bg-success text-white h-100">
              <div className="card-body">
                <h5 className="card-title">Incoming Meetings</h5>
                <p className="display-4">{stats.incomingMeetings}</p>
                <p className="card-text">Meetings scheduled this week</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="card bg-warning text-dark h-100">
              <div className="card-body">
                <h5 className="card-title">Total Registered Users</h5>
                <p className="display-4">{stats.totalUsers}</p>
                <p className="card-text">Total users in the system</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="card bg-danger text-white h-100">
              <div className="card-body">
                <h5 className="card-title">Total Completed Tasks</h5>
                <p className="display-4">{stats.completedTasks}</p>
                <p className="card-text">Tasks completed so far</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <RecentActivityFeed />
          </div>
        </div>
      </div>

      {/* Add styles for the title and underline */}
      <style jsx>{`
        .title-underline {
          height: 4px;
          width: 100px;
          border-radius: 2px;
          background: linear-gradient(90deg, #ffc107, #28a745, #8b4513, #dc3545);
        }
      `}</style>
    </Layout>
  );
}
