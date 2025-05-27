import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from 'components/MainLayout/Layout';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import Link from 'next/link';


export default function TaskList() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const tasksRef = collection(db, 'employee_tasks');
      const q = query(tasksRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const tasksList = [];
      querySnapshot.forEach((doc) => {
        const taskData = doc.data();
        tasksList.push({
          id: doc.id,
          ...taskData,
          deadline: taskData.deadline?.toDate(),
          createdAt: taskData.createdAt?.toDate()
        });
      });
      
      setTasks(tasksList);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No deadline set';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Layout>
      <div className="container py-4">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/admin/dashboard">Dashboard</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/admin/usermanagement">User Management</Link>
            </li>
            <li className="breadcrumb-item active">Tasks</li>
          </ol>
        </nav>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">Employee Tasks</h1>
          <div>
            <button
              className="btn btn-outline-secondary me-2"
              onClick={() => router.push('/admin/usermanagement')}
            >
              Back to User Management
            </button>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/admin/tasks/create')}
            >
              Create New Task
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="alert alert-info">No tasks found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Deadline</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div className="fw-bold">{task.title}</div>
                      <small className="text-muted">{task.description}</small>
                    </td>
                    <td>
                      {task.assignedToName || task.assignedToEmail || 'Unassigned'}
                    </td>
                    <td>
                      <span className={`badge bg-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'primary' : 'secondary'}`}>
                        {task.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{formatDate(task.deadline)}</td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => router.push(`/admin/tasks/edit/${task.id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => router.push(`/admin/tasks/delete/${task.id}`)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
} 