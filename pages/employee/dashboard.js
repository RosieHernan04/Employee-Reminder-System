'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from 'components/MainLayout/Layout';
import { db } from 'lib/firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { format } from 'date-fns';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useUser } from '../../dataconnect/context/UserContext';

// Register Chart.js components to fix "category is not a registered scale" error
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    setLoading(true);
    let unsubscribeEmployeeTasks = null;
    let unsubscribeSelfTasks = null;
    let unsubscribeMeetings = null;

    // Improved helper to check if task/meeting belongs to current user
    function isMine(item) {
      if (!user) return false;
      const userIds = [user.id, user.uid].filter(Boolean);
      const userEmails = [user.email].filter(Boolean);

      // Check all possible fields for id/email match
      return (
        userIds.includes(item.assignedTo?.id) ||
        userEmails.includes(item.assignedTo?.email) ||
        userIds.includes(item.userId) ||
        userEmails.includes(item.userId) ||
        userIds.includes(item.createdBy?.id) ||
        userEmails.includes(item.createdBy?.email)
      );
    }

    // Real-time listener for employee_tasks (assigned to employee)
    const employeeTasksQuery = query(
      collection(db, 'employee_tasks'),
      orderBy('deadline', 'desc')
    );
    unsubscribeEmployeeTasks = onSnapshot(employeeTasksQuery, snapshot => {
      const employeeTasks = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          deadline: doc.data().deadline?.toDate() || new Date(),
          type: 'employee_task',
          source: 'employee_tasks',
          status: doc.data().status || 'pending',
          priority: doc.data().priority ? doc.data().priority : 'high'
        }))
        .filter(isMine); // Only tasks for this user
      updateTasks(employeeTasks, null, null);
    });

    // Real-time listener for self tasks (tasks collection)
    const selfTasksQuery = query(
      collection(db, 'tasks'),
      orderBy('dueDate', 'desc')
    );
    unsubscribeSelfTasks = onSnapshot(selfTasksQuery, snapshot => {
      const selfTasks = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          deadline: doc.data().dueDate?.toDate() || new Date(),
          type: 'self_task',
          source: 'tasks',
          status: doc.data().status || 'pending',
          priority: doc.data().priority ? doc.data().priority : 'high'
        }))
        .filter(isMine); // Only tasks for this user
      updateTasks(null, selfTasks, null);
    });

    // Real-time listener for employee_meetings
    const meetingsQuery = query(
      collection(db, 'employee_meetings'),
      orderBy('start', 'desc')
    );
    unsubscribeMeetings = onSnapshot(meetingsQuery, snapshot => {
      const meetings = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          deadline: doc.data().start?.toDate() || new Date(),
          type: 'meeting',
          source: 'employee_meetings',
          status: doc.data().status || 'pending',
          priority: 'medium'
        }))
        .filter(isMine); // Only meetings for this user
      updateTasks(null, null, meetings);
    });

    // Helper to combine and filter tasks
    let latestEmployeeTasks = [];
    let latestSelfTasks = [];
    let latestMeetings = [];

    function updateTasks(employeeTasks, selfTasks, meetings) {
      if (employeeTasks !== null) latestEmployeeTasks = employeeTasks;
      if (selfTasks !== null) latestSelfTasks = selfTasks;
      if (meetings !== null) latestMeetings = meetings;

      // Combine all
      const allTasks = [
        ...latestEmployeeTasks,
        ...latestSelfTasks,
        ...latestMeetings
      ].filter(task => task && task.id);

      setDeadlines(allTasks);
      setLoading(false);
    }

    // Cleanup listeners on unmount
    return () => {
      if (unsubscribeEmployeeTasks) unsubscribeEmployeeTasks();
      if (unsubscribeSelfTasks) unsubscribeSelfTasks();
      if (unsubscribeMeetings) unsubscribeMeetings();
    };
  }, [user]);

  // Helper to check if a date is in the current month and year
  function isCurrentMonth(date) {
    if (!date) return false;
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }

  // Helper to check if a task/meeting is overdue (not completed and deadline < now)
  function isOverdue(item) {
    const now = new Date();
    return (item.status !== 'completed') && item.deadline < now;
  }

  // Filter deadlines: show all overdue, and all others only if in current month
  const filteredDeadlines = deadlines.filter(item =>
    isOverdue(item) || isCurrentMonth(item.deadline)
  );

  // Aggregates
  const now = new Date();
  // Only count tasks that are not completed and are in filteredDeadlines
  const totalTasks = filteredDeadlines.filter(
    d => (d.type === 'employee_task' || d.type === 'self_task') && d.status !== 'completed'
  ).length;
  const completedTasks = filteredDeadlines.filter(
    d => (d.type === 'employee_task' || d.type === 'self_task') && d.status === 'completed'
  ).length;
  const overdueTasks = filteredDeadlines.filter(
    d => (d.type === 'employee_task' || d.type === 'self_task') && (d.status === 'pending' || d.status === 'assigned') && d.deadline < now
  ).length;
  const totalMeetings = filteredDeadlines.filter(d => d.type === 'meeting' && d.status !== 'completed').length;

  // Prepare data for Bar chart
  const taskProgressData = {
    labels: ['Total Tasks', 'Completed Tasks', 'Overdue Tasks', 'Total Meetings'],
    datasets: [
      {
        label: 'Task Progress',
        data: [totalTasks, completedTasks, overdueTasks, totalMeetings],
        backgroundColor: [
          'rgba(0,123,255,0.45)',   // glassy blue
          'rgba(40,167,69,0.35)',   // glassy green
          'rgba(220,53,69,0.35)',   // glassy red
          'rgba(255,193,7,0.35)'    // glassy yellow
        ],
        borderColor: [
          'rgba(0,123,255,0.85)',
          'rgba(40,167,69,0.85)',
          'rgba(220,53,69,0.85)',
          'rgba(255,193,7,0.85)'
        ],
        borderWidth: 2,
        borderRadius: 12,
        hoverBackgroundColor: [
          'rgba(0,123,255,0.7)',
          'rgba(40,167,69,0.7)',
          'rgba(220,53,69,0.7)',
          'rgba(255,193,7,0.7)'
        ]
      }
    ]
  };

  const barOptions = {
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0,123,255,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(0,123,255,0.5)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0,123,255,0.08)'
        },
        ticks: {
          color: '#007bff',
          font: { weight: 'bold' }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,123,255,0.08)'
        },
        ticks: {
          color: '#007bff',
          font: { weight: 'bold' }
        }
      }
    }
  };

  return (
    <Layout>
      <div className="container-fluid py-4 glass-bg">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h1 className="display-4 fw-bold text-primary mb-0 glass-title">
            Employee Dashboard
            <div className="title-underline bg-primary mt-2"></div>
          </h1>
        </div>

        {/* Task Overview Widgets */}
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="card glass-card glass-blue text-white h-100">
              <div className="card-body">
                <h5 className="card-title">Total Tasks</h5>
                <p className="display-4">{totalTasks}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card glass-card glass-green text-white h-100">
              <div className="card-body">
                <h5 className="card-title">Completed Tasks</h5>
                <p className="display-4">{completedTasks}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card glass-card glass-red text-white h-100">
              <div className="card-body">
                <h5 className="card-title">Overdue Tasks</h5>
                <p className="display-4">{overdueTasks}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card glass-card glass-yellow text-dark h-100">
              <div className="card-body">
                <h5 className="card-title">Total Meetings</h5>
                <p className="display-4">{totalMeetings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Task Progress Bar Graph */}
        <div className="mb-5 glass-section glass-bar">
          <h2 className="glass-title">Task Progress</h2>
          <Bar data={taskProgressData} options={barOptions} />
        </div>

        {/* Progress Table */}
        <div className="glass-section glass-table-section">
          <h2 className="glass-title">Progress Table</h2>
          {filteredDeadlines.length === 0 ? (
            <p>No data available for tasks or meetings.</p>
          ) : (
            <div className="table-responsive">
              <table className="table glass-table align-middle">
                <thead>
                  <tr>
                    <th className="glass-th glass-th-blue-dark text-center" style={{width: '20%'}}>Title</th>
                    <th className="glass-th glass-th-blue-dark text-center" style={{width: '30%'}}>Description</th>
                    <th className="glass-th glass-th-blue-dark text-center" style={{width: '20%'}}>Deadline</th>
                    <th className="glass-th glass-th-blue-dark text-center" style={{width: '15%'}}>Priority</th>
                    <th className="glass-th glass-th-blue-dark text-center" style={{width: '15%'}}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeadlines.map(item => (
                    <tr key={item.id} className="glass-row">
                      <td className="glass-td glass-td-blue text-center">{item.title}</td>
                      <td className="glass-td text-center">{item.description}</td>
                      <td className="glass-td text-center">
                        {item.deadline ? format(new Date(item.deadline), 'MMM d, yyyy h:mm a') : ''}
                      </td>
                      <td className="glass-td text-center">
                        <span className={`badge glass-badge-priority-bg ${getPriorityBgClass(item.priority)}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="glass-td text-center">
                        <span className={`badge glass-badge-status-bg ${getStatusBgClass(item.status)}`}>
                          {item.status}
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
      <style jsx>{`
        .glass-bg {
          background: rgba(255,255,255,0.15);
          border-radius: 16px;
          box-shadow: 0 8px 32px 0 rgba(31,38,135,0.18);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 2rem;
        }
        .glass-card {
          background: rgba(255,255,255,0.18);
          border-radius: 18px;
          box-shadow: 0 4px 24px 0 rgba(31,38,135,0.12);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.25);
        }
        .glass-blue {
          background: linear-gradient(135deg, #007bffcc 60%, #8b4513cc 100%);
        }
        .glass-green {
          background: linear-gradient(135deg, #28a745cc 60%, #8b4513cc 100%);
        }
        .glass-red {
          background: linear-gradient(135deg, #dc3545cc 60%, #8b4513cc 100%);
        }
        .glass-yellow {
          background: linear-gradient(135deg, #ffc107cc 60%, #8b4513cc 100%);
        }
        .glass-section {
          background: rgba(255,255,255,0.18);
          border-radius: 16px;
          box-shadow: 0 2px 12px 0 rgba(31,38,135,0.10);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          padding: 2rem;
          margin-bottom: 2rem;
        }
        .glass-bar {
          border: 1.5px solid rgba(0,123,255,0.18);
          background: linear-gradient(120deg, rgba(0,123,255,0.10) 60%, rgba(139,69,19,0.10) 100%);
        }
        .glass-table-section {
          border: 1.5px solid rgba(0,123,255,0.18);
          background: linear-gradient(120deg, rgba(0,123,255,0.10) 60%, rgba(139,69,19,0.10) 100%);
        }
        .glass-table {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px 0 rgba(0,123,255,0.10);
          border: 1.5px solid rgba(0,123,255,0.18);
        }
        .glass-th {
          font-weight: 700;
          border-bottom: 2px solid rgba(0,123,255,0.15);
          color: #fff;
          text-shadow: 0 1px 4px rgba(0,123,255,0.18);
        }
        .glass-th-blue-dark {
          background: #003366;
        }
        .glass-td {
          background: transparent;
          border-bottom: 1px solid rgba(0,123,255,0.08);
          color: #222;
        }
        .glass-td-blue {
          background: #e7f1ff;
          color: #007bff;
          font-weight: 600;
        }
        .glass-row:hover {
          background: rgba(0,123,255,0.06);
        }
        /* Priority badge backgrounds */
        .glass-badge-priority-bg {
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.95em;
          padding: 0.5em 0.9em;
          color: #fff;
        }
        .priority-low-bg { background: #28a745; }      /* green */
        .priority-medium-bg { background: #ffc107; color: #222; }  /* yellow */
        .priority-high-bg { background: #dc3545; }     /* red */
        /* Status badge backgrounds */
        .glass-badge-status-bg {
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.95em;
          padding: 0.5em 0.9em;
          color: #fff;
        }
        .status-completed-bg { background: #28a745; }  /* green */
        .status-pending-bg { background: #ffc107; color: #222; }   /* yellow */
        .status-overdue-bg { background: #dc3545; }    /* red */
        .status-assigned-bg { background: #007bff; }   /* blue */
        /* Type badge backgrounds */
        .glass-badge-type-bg {
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.95em;
          padding: 0.5em 0.9em;
          color: #fff;
        }
        .type-employee_task-bg { background: #007bff; }
        .type-self_task-bg { background: #28a745; }
        .type-meeting-bg { background: #ffc107; color: #222; }
        .type-default-bg { background: #8b4513; }
        /* Source badge backgrounds */
        .glass-badge-source-bg {
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.95em;
          padding: 0.5em 0.9em;
          color: #fff;
        }
        .source-employee_tasks-bg { background: #007bff; }
        .source-tasks-bg { background: #28a745; }
        .source-employee_meetings-bg { background: #ffc107; color: #222; }
        .source-default-bg { background: #8b4513; }
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

function getPriorityBgClass(priority) {
  switch ((priority || '').toLowerCase()) {
    case 'low':
      return 'priority-low-bg';
    case 'medium':
      return 'priority-medium-bg';
    case 'high':
      return 'priority-high-bg';
    default:
      return 'priority-high-bg';
  }
}

function getStatusBgClass(status) {
  switch ((status || '').toLowerCase()) {
    case 'completed':
      return 'status-completed-bg';
    case 'pending':
      return 'status-pending-bg';
    case 'overdue':
      return 'status-overdue-bg';
    case 'assigned':
      return 'status-assigned-bg';
    default:
      return 'status-pending-bg';
  }
}

function getTypeBgClass(type) {
  switch ((type || '').toLowerCase()) {
    case 'employee_task':
      return 'type-employee_task-bg';
    case 'self_task':
      return 'type-self_task-bg';
    case 'meeting':
      return 'type-meeting-bg';
    default:
      return 'type-default-bg';
  }
}

function getSourceBgClass(source) {
  switch ((source || '').toLowerCase()) {
    case 'employee_tasks':
      return 'source-employee_tasks-bg';
    case 'tasks':
      return 'source-tasks-bg';
    case 'employee_meetings':
      return 'source-employee_meetings-bg';
    default:
      return 'source-default-bg';
  }
}