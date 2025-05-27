import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout/Layout';

const AdminTasks = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const q = query(collection(db, 'admin_tasks'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const tasksData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          deadline: doc.data().deadline?.toDate()
        }));
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const formatDate = (date) => {
    if (!date) return 'No deadline';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Admin Tasks</h1>
          <div className="d-flex align-items-center">
            <span className="badge bg-primary me-3">Total Tasks: {tasks.length}</span>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/admin/tasks/admin/create')}
            >
              Create Task
            </button>
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Task List</h5>
              <span className="badge bg-primary">{tasks.length} Tasks</span>
            </div>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted mb-0">No tasks found</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Priority</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id}>
                        <td>{task.title}</td>
                        <td>
                          <span className={`badge bg-${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td>{formatDate(task.deadline)}</td>
                        <td>
                          <span className={`badge bg-${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(task.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(task.id)}
                          >
                            Delete
                          </button>
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
    </Layout>
  );
};

export default AdminTasks; 