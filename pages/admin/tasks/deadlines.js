'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout/layout';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../dataconnect/firebase';

export default function ManageDeadlines() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const tasksQuery = query(collection(db, 'admin_tasks'));
      const querySnapshot = await getDocs(tasksQuery);
      const tasksData = [];
      
      querySnapshot.forEach((doc) => {
        tasksData.push({
          id: doc.id,
          ...doc.data(),
          deadline: doc.data().deadline?.toDate()
        });
      });
      
      // Sort tasks by deadline
      tasksData.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline - b.deadline;
      });
      
      setTasks(tasksData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const handleExtendDeadline = async (taskId, days) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const newDeadline = new Date(task.deadline);
      newDeadline.setDate(newDeadline.getDate() + days);

      await updateDoc(doc(db, 'admin_tasks', taskId), {
        deadline: newDeadline,
        updatedAt: new Date()
      });

      await fetchTasks();
      alert('Deadline updated successfully!');
    } catch (error) {
      console.error('Error updating deadline:', error);
      alert('Error updating deadline. Please try again.');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No deadline';
    return new Date(date).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return { text: 'No deadline', class: 'text-muted' };
    
    const now = new Date();
    const diff = deadline - now;
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { text: 'Overdue', class: 'text-danger' };
    if (daysLeft === 0) return { text: 'Due today', class: 'text-warning' };
    if (daysLeft <= 3) return { text: `${daysLeft} days left`, class: 'text-warning' };
    return { text: `${daysLeft} days left`, class: 'text-success' };
  };

  return (
    <Layout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-0">Manage Task Deadlines</h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <a href="/admin/dashboard">Dashboard</a>
                </li>
                <li className="breadcrumb-item">
                  <a href="/admin/usermanagement">Task Management</a>
                </li>
                <li className="breadcrumb-item active">Manage Deadlines</li>
              </ol>
            </nav>
          </div>
          <button
            className="btn btn-outline-secondary"
            onClick={() => router.back()}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
            <p className="mt-3">No tasks found</p>
          </div>
        ) : (
          <div className="row">
            {tasks.map(task => {
              const deadlineStatus = getDeadlineStatus(task.deadline);
              return (
                <div key={task.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100 shadow-sm">
                    <div className={`card-header bg-${task.priority}`}>
                      <h5 className="mb-0 text-white">{task.title}</h5>
                    </div>
                    <div className="card-body">
                      <p className="card-text">{task.description}</p>
                      <div className="mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div>
                            <i className="bi bi-clock me-2"></i>
                            Current Deadline:
                          </div>
                          <span className={deadlineStatus.class}>
                            {formatDate(task.deadline)}
                            <br />
                            <small>{deadlineStatus.text}</small>
                          </span>
                        </div>
                        <div className="btn-group w-100 mt-3">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleExtendDeadline(task.id, 1)}
                          >
                            +1 Day
                          </button>
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleExtendDeadline(task.id, 3)}
                          >
                            +3 Days
                          </button>
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleExtendDeadline(task.id, 7)}
                          >
                            +1 Week
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .card {
          border: none;
          transition: transform 0.2s;
        }

        .card:hover {
          transform: translateY(-5px);
        }

        .card-header {
          border-bottom: none;
          border-radius: 10px 10px 0 0;
        }

        .bg-high {
          background: linear-gradient(135deg, #ef5350 0%, #e53935 100%);
        }

        .bg-medium {
          background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%);
        }

        .bg-low {
          background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
        }

        .btn-group .btn {
          flex: 1;
        }
      `}</style>
    </Layout>
  );
} 